import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { AlertCircle, Lock, LogIn, Mail } from 'lucide-react-native';
import { useAuth, useLogin } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/contexts/ThemeContext';
import { validateLoginForm } from '../../src/utils/validation';
import { ROUTES } from '../../src/navigation/routes';
import { FormError, IconTextField } from '../../src/components/forms/IconTextField';
import { authFormStyles as styles } from '../../src/components/auth/authFormStyles';

/**
 * Login com Firebase Authentication. Após o sucesso o layout (auth)
 * redireciona para a área do tipo de conta (tutor, veterinário ou clínica).
 */
export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const { authAvailable } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    const validationError = validateLoginForm(email, password);
    setError(validationError);
    if (validationError) return;
    login.mutate(
      { email, password },
      { onError: (err) => setError(err.message || 'Não foi possível entrar. Tente novamente.') }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={[styles.title, { color: colors.text }]}>Entrar</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tutores, veterinários e clínica acessam com e-mail e senha
        </Text>
      </View>

      <FormError
        message={authAvailable ? error : 'Login temporariamente indisponível: o app foi gerado sem a configuração do Firebase.'}
        icon={<AlertCircle size={16} color="#b91c1c" />}
      />

      <IconTextField
        label="E-mail"
        icon={<Mail size={16} color={colors.textMuted} />}
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      <IconTextField
        label="Senha"
        icon={<Lock size={16} color={colors.textMuted} />}
        labelAccessory={
          <TouchableOpacity onPress={() => router.push(ROUTES.auth.forgotPassword as Href)}>
            <Text style={[styles.smallLink, { color: colors.accent }]}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        }
        placeholder="Sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={login.isPending}
        activeOpacity={0.85}
        style={[styles.submitBtn, login.isPending && styles.submitBtnDisabled]}
        accessibilityRole="button"
      >
        {login.isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <LogIn size={16} color="#ffffff" />
            <Text style={styles.submitBtnText}>Entrar na conta</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Ainda não tem conta? </Text>
        <TouchableOpacity onPress={() => router.push(ROUTES.auth.register as Href)}>
          <Text style={[styles.linkText, { color: colors.accent }]}>Criar conta grátis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
