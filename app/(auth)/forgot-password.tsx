import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react-native';
import { usePasswordReset } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/contexts/ThemeContext';
import { validateEmailForm } from '../../src/utils/validation';
import { ROUTES } from '../../src/navigation/routes';
import { FormError, IconTextField } from '../../src/components/forms/IconTextField';
import { authFormStyles } from '../../src/components/auth/authFormStyles';

/** Recuperação de senha: o Firebase envia o link de redefinição por e-mail. */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const passwordReset = usePasswordReset();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    const validationError = validateEmailForm(email);
    setError(validationError);
    if (validationError) return;
    passwordReset.mutate(email, {
      onError: (err) => setError(err.message || 'Não foi possível enviar o e-mail de recuperação.'),
    });
  };

  const goToLogin = () => router.push(ROUTES.auth.login as Href);

  return (
    <View style={authFormStyles.container}>
      <View style={authFormStyles.headerArea}>
        <Text style={[authFormStyles.title, { color: colors.text }]}>Recuperar senha</Text>
        <Text style={[authFormStyles.subtitle, { color: colors.textSecondary }]}>
          Digite o e-mail cadastrado para receber o link de redefinição
        </Text>
      </View>

      {passwordReset.isSuccess ? (
        <View style={styles.submittedContainer}>
          <View style={[styles.successIconCircle, { backgroundColor: colors.primaryLight }]}>
            <CheckCircle2 size={32} color="#10b981" />
          </View>
          <Text style={[styles.submittedTitle, { color: colors.text }]}>E-mail enviado!</Text>
          <Text style={[styles.submittedSubtitle, { color: colors.textSecondary }]}>
            Enviamos para {email.trim()} um link para redefinir sua senha. Verifique também a caixa de spam.
          </Text>
          <TouchableOpacity onPress={goToLogin} style={authFormStyles.submitBtn}>
            <Text style={authFormStyles.submitBtnText}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <FormError message={error} icon={<AlertCircle size={16} color="#b91c1c" />} />
          <IconTextField
            label="E-mail cadastrado"
            icon={<Mail size={16} color={colors.textMuted} />}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="send"
            onSubmitEditing={handleReset}
          />
          <TouchableOpacity
            onPress={handleReset}
            disabled={passwordReset.isPending}
            activeOpacity={0.85}
            style={[authFormStyles.submitBtn, passwordReset.isPending && authFormStyles.submitBtnDisabled]}
          >
            {passwordReset.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={authFormStyles.submitBtnText}>Enviar link de recuperação</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={goToLogin} style={styles.backRow}>
            <ArrowLeft size={14} color={colors.textSecondary} />
            <Text style={[styles.backText, { color: colors.textSecondary }]}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  submittedContainer: { alignItems: 'center', paddingVertical: 16 },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submittedTitle: { fontSize: 18, fontWeight: '700' },
  submittedSubtitle: { fontSize: 13, marginTop: 8, marginBottom: 12, textAlign: 'center', lineHeight: 20 },
  backRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 18 },
  backText: { fontSize: 13, fontWeight: '600' },
});
