import { StyleSheet } from 'react-native';

/** Estilos compartilhados pelas telas de login, cadastro e recuperação de senha. */
export const authFormStyles = StyleSheet.create({
  container: { width: '100%' },
  headerArea: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 13 },
  linkText: { fontSize: 13, fontWeight: '700' },
  smallLink: { fontSize: 12, fontWeight: '700' },
});
