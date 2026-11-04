/**
 * Teste de integração da API (fluxo completo com os três perfis).
 *
 * Requer o Firebase Auth Emulator em execução:
 *   firebase emulators:start --only auth --project demo-aurorapet
 * Execução:  npm --prefix server test
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const PORT = 3999;
const API = `http://localhost:${PORT}/api`;
const DATA_FILE = path.join(os.tmpdir(), `aurorapet-test-${Date.now()}.json`);
let server;

async function signUp(email) {
  const res = await fetch(`http://${EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'senha123', returnSecureToken: true }),
  });
  const body = await res.json();
  assert.ok(body.idToken, `falha ao criar ${email}: ${JSON.stringify(body)}`);
  return body.idToken;
}

function client(token) {
  const call = async (method, endpoint, body) => {
    const res = await fetch(`${API}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  };
  return {
    get: (e) => call('GET', e),
    post: (e, b) => call('POST', e, b),
    put: (e, b) => call('PUT', e, b),
    del: (e) => call('DELETE', e),
  };
}

/** Próxima data (a partir de amanhã) em que o especialista atende. */
function nextWorkingDate(availableDays) {
  const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  for (let offset = 1; offset < 15; offset += 1) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    if (availableDays.includes(names[d.getDay()])) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }
  throw new Error('sem data disponível');
}

before(async () => {
  server = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'index.js')], {
    env: { ...process.env, PORT: String(PORT), DATA_FILE, FIREBASE_AUTH_EMULATOR_HOST: EMULATOR, FIREBASE_PROJECT_ID: 'demo-aurorapet' },
    stdio: 'ignore',
  });
  for (let i = 0; i < 40; i += 1) {
    try {
      if ((await fetch(`${API}/health`)).ok) return;
    } catch {
      /* aguardando o servidor subir */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('API não iniciou');
});

after(() => {
  server?.kill();
  fs.rmSync(DATA_FILE, { force: true });
});

test('fluxo completo: tutor agenda, veterinário atende e tutor recebe o laudo', async () => {
  const stamp = Date.now();
  const tutor = client(await signUp(`tutor${stamp}@teste.com`));
  const otherTutor = client(await signUp(`outro${stamp}@teste.com`));
  const vet = client(await signUp(`vet${stamp}@teste.com`));
  const admin = client(await signUp(`admin${stamp}@teste.com`));
  const anonymous = client();

  // autenticação obrigatória
  assert.equal((await anonymous.get('/pets')).status, 401);
  assert.equal((await client('token-invalido').get('/pets')).status, 401);

  // perfis
  assert.equal((await tutor.put('/users/me', { displayName: 'Ana Tutora', role: 'tutor' })).status, 200);
  assert.equal((await otherTutor.put('/users/me', { displayName: 'Bruno Tutor', role: 'tutor' })).status, 200);
  const vetProfile = await vet.put('/users/me', { displayName: 'Dr. Caio Vet', role: 'veterinarian', crmv: 'CRMV-SP 99.999', specialty: 'Clínica Geral' });
  assert.equal(vetProfile.status, 200);
  assert.ok(vetProfile.body.specialistId, 'veterinário deve ser vinculado ao corpo clínico');
  assert.equal((await admin.put('/users/me', { displayName: 'Dra. Admin', role: 'clinic_admin' })).status, 200);
  const duplicateVet = client(await signUp(`vet2${stamp}@teste.com`));
  const duplicate = await duplicateVet.put('/users/me', { displayName: 'Outro Vet', role: 'veterinarian', crmv: 'CRMV-SP 99.999' });
  assert.equal(duplicate.status, 409, 'CRMV não pode ser vinculado a duas contas');
  assert.equal((await tutor.put('/users/me', { role: 'clinic_admin' })).status, 409, 'tipo de conta não pode mudar');

  // controle de acesso por perfil
  assert.equal((await tutor.get('/clinic/subscription')).status, 403);
  assert.equal((await vet.post('/specialists', { name: 'X', crmv: 'Y', specialty: 'Z' })).status, 403);

  // CRUD de pet
  const created = await tutor.post('/pets', { name: 'Thor', species: 'dog', breed: 'Golden', age: '3 anos', weight: '30,5' });
  assert.equal(created.status, 201);
  assert.equal(created.body.weight, '30.5 kg');
  const petId = created.body.id;
  assert.equal((await tutor.put(`/pets/${petId}`, { notes: 'Alergia a frango' })).body.notes, 'Alergia a frango');
  assert.equal((await tutor.get('/pets')).body.length, 1);
  assert.equal((await otherTutor.get(`/pets/${petId}`)).status, 403, 'outro tutor não lê o pet');
  assert.equal((await vet.get(`/pets/${petId}`)).status, 403, 'vet sem autorização não lê o pet');
  assert.equal((await tutor.post('/pets', { name: '', species: 'dog' })).status, 400);

  // agendamento com o veterinário recém-cadastrado
  const specialist = (await tutor.get(`/specialists/${vetProfile.body.specialistId}`)).body;
  const date = nextWorkingDate(specialist.availableDays);
  const time = specialist.availableHours[0];
  const service = (await tutor.get('/services')).body[0];
  const booking = { petId, specialistId: specialist.id, serviceId: service.id, date, time, notes: 'Coceira na orelha' };
  const appointment = await tutor.post('/appointments', booking);
  assert.equal(appointment.status, 201);
  assert.equal((await otherTutor.post('/appointments', booking)).status, 400, 'pet de outro tutor');
  assert.deepEqual((await tutor.get(`/specialists/${specialist.id}/busy-slots?date=${date}`)).body, [time]);
  assert.equal((await tutor.post('/appointments', { ...booking, date: '2020-01-01' })).status, 400, 'data passada');

  // veterinário e clínica são notificados do agendamento
  const vetNotifications = (await vet.get('/notifications')).body;
  assert.ok(vetNotifications.some((n) => n.title === 'Nova consulta agendada'));
  assert.ok((await admin.get('/notifications')).body.some((n) => n.actionUrl.includes(appointment.body.id)));

  // autorização de acesso ao prontuário
  const authorization = await tutor.post('/authorizations', { petId, veterinarianId: specialist.id, durationDays: 30 });
  assert.equal(authorization.status, 201);
  assert.ok(authorization.body.expiresAt);
  assert.equal((await vet.get('/authorizations')).body.length, 1);
  assert.equal((await vet.get(`/pets/${petId}`)).status, 200, 'vet autorizado lê o prontuário');

  // atendimento e laudo
  assert.equal((await tutor.post(`/appointments/${appointment.body.id}/report`, { anamnesis: 'a', diagnosis: 'b' })).status, 403);
  const report = await vet.post(`/appointments/${appointment.body.id}/report`, {
    anamnesis: 'Prurido auricular há 3 dias',
    diagnosis: 'Otite externa',
    vitalSigns: { weight: '31 kg' },
    prescriptions: [{ id: 'rx1', medication: 'Otomax', dosage: '5 gotas', frequency: '12/12h', duration: '7 dias' }],
  });
  assert.equal(report.status, 200);
  assert.equal(report.body.status, 'completed');
  assert.equal((await tutor.get(`/pets/${petId}`)).body.weight, '31 kg', 'peso aferido atualiza o prontuário');
  const tutorNotifications = (await tutor.get('/notifications')).body;
  const reportNotification = tutorNotifications.find((n) => n.title === 'Laudo de Thor disponível');
  assert.ok(reportNotification, 'tutor recebe notificação do laudo');
  assert.equal(reportNotification.actionUrl, `/tutor/appointments/${appointment.body.id}`);
  assert.equal((await tutor.put(`/notifications/${reportNotification.id}/read`)).body.read, true);

  // remarcar e cancelar outra consulta
  const second = await tutor.post('/appointments', { ...booking, time: specialist.availableHours[1] });
  assert.equal(second.status, 201);
  assert.equal((await tutor.put(`/appointments/${second.body.id}`, { time: specialist.availableHours[2] })).status, 200);
  assert.equal((await tutor.put(`/appointments/${second.body.id}`, { status: 'cancelled' })).body.status, 'cancelled');
  assert.equal((await tutor.del(`/appointments/${second.body.id}`)).status, 200);

  // revogação
  assert.equal((await tutor.put(`/authorizations/${authorization.body.id}/revoke`, {})).body.status, 'REVOKED');
  assert.ok((await vet.get('/notifications')).body.some((n) => n.type === 'ACCESS_REVOKED'));

  // solicitações administrativas
  const request = await vet.post('/requests', { title: 'Reposição de vacinas', description: 'Estoque de V10 acabando', priority: 'HIGH' });
  assert.equal(request.status, 201);
  assert.equal((await admin.put(`/requests/${request.body.id}`, { status: 'REJECTED' })).status, 400, 'recusa exige parecer');
  assert.equal((await admin.put(`/requests/${request.body.id}`, { status: 'APPROVED', adminFeedback: 'Pedido feito' })).status, 200);
  assert.ok((await vet.get('/notifications')).body.some((n) => n.title === 'Solicitação aprovada'));

  // gestão da clínica
  const newVet = await admin.post('/specialists', { name: 'Dra. Nova', crmv: `CRMV-SP ${stamp}`, specialty: 'Dermatologia' });
  assert.equal(newVet.status, 201);
  assert.equal((await admin.put(`/specialists/${newVet.body.id}`, { specialty: 'Dermatologia Felina' })).body.specialty, 'Dermatologia Felina');
  assert.equal((await admin.del(`/specialists/${newVet.body.id}`)).status, 200);
  const subscription = await admin.put('/clinic/subscription', { planId: 'plan-enterprise' });
  assert.equal(subscription.body.planCode, 'enterprise');
  assert.equal(subscription.body.limits.usedPatients, 1);
  assert.equal((await admin.put('/clinic', { phone: '(11) 4000-0000' })).body.phone, '(11) 4000-0000');

  // exclusão do pet
  assert.equal((await tutor.del(`/pets/${petId}`)).status, 200);
  assert.equal((await tutor.get('/pets')).body.length, 0);
});
