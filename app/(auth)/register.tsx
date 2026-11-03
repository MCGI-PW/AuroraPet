import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { AlertCircle, BadgeCheck, Lock, Mail, Stethoscope, User, UserPlus } from 'lucide-react-native';
import { useRegister } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/contexts/ThemeContext';
import { validateRegisterForm } from '../../src/utils/validation';
import { ROUTES } from '../../src/navigation/routes';
import { UserRole } from '../../src/types/auth';
import { FormError, IconTextField } from '../../src/components/forms/IconTextField';
import { AccountTypeSelector } from '../../src/components/auth/AccountTypeSelector';
import { authFormStyles as styles } from '../../src/components/auth/authFormStyles';

/**
 * Cadastro: cria a conta no Firebase Authentication e o perfil na API.
 * Veterinários informam o CRMV e passam a integrar o corpo clínico.
 */
export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const { colors } = useTheme();

  const [role, setRole] = useState<UserRole>('tutor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [crmv, setCrmv] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = () => {
    const input = { name, email, password, role, crmv, specialty };
    const validationError = validateRegisterForm(input, confirmPassword);
    setError(validationError);
    if (validationError) return;
    register.mutate(input, {
      onError: (err) => setError(err.message || 'Não foi possível criar a conta. Tente novamente.'),
    });
  };

  const muted = colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={[styles.title, { color: colors.text }]}>Criar conta</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Gerencie a saúde dos seus pets ou atenda pela clínica
        </Text>
      </View>

      <FormError message={error} icon={<AlertCircle size={16} color="#b91c1c" />} />

      <AccountTypeSelector value={role} onChange={setRole} />

      <IconTextField
        label={role === 'clinic_admin' ? 'Nome do responsável' : 'Nome completo'}
        icon={<User size={16} color={muted} />}
        placeholder="Ex.: Ana Clara Silva"
        value={name}
        onChangeText={setName}
        autoComplete="name"
      />
      <IconTextField
        label="E-mail"
        icon={<Mail size={16} color={muted} />}
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      {role === 'veterinarian' && (
        <>
          <IconTextField
            label="CRMV"
            icon={<BadgeCheck size={16} color={muted} />}
            placeholder="Ex.: CRMV-SP 12.345"
            value={crmv}
            onChangeText={setCrmv}
            autoCapitalize="characters"
          />
          <IconTextField
            label="Especialidade"
            icon={<Stethoscope size={16} color={muted} />}
            placeholder="Ex.: Clínica Geral"
            value={specialty}
            onChangeText={setSpecialty}
          />
        </>
      )}

      <IconTextField
        label="Senha"
        icon={<Lock size={16} color={muted} />}
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <IconTextField
        label="Confirmar senha"
        icon={<Lock size={16} color={muted} />}
        placeholder="Repita sua senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={handleRegister}
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={register.isPending}
        activeOpacity={0.85}
        style={[styles.submitBtn, register.isPending && styles.submitBtnDisabled]}
        accessibilityRole="button"
      >
        {register.isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <UserPlus size={16} color="#ffffff" />
            <Text style={styles.submitBtnText}>Criar minha conta</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Já possui conta? </Text>
        <TouchableOpacity onPress={() => router.push(ROUTES.auth.login as Href)}>
          <Text style={[styles.linkText, { color: colors.accent }]}>Fazer login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
