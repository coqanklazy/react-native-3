import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  icon?: string;
  error?: string;
}

const TextField: React.FC<TextFieldProps> = ({ label, required, icon, error, ...inputProps }) => {
  const showError = !!error && error.length > 0;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={[styles.inputContainer, showError && styles.inputError]}>
        {icon && (
          <FontAwesome
            name={icon as any}
            size={20}
            color={inputProps.value ? COLORS.primary : COLORS.textLight}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textLight}
          {...inputProps}
        />
      </View>
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SIZES.md,
  },
  label: {
    ...FONTS.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SIZES.md,
    height: SIZES.inputHeight,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  icon: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    ...FONTS.body1,
    color: COLORS.text,
  },
  errorText: {
    ...FONTS.body3,
    color: COLORS.error,
    marginTop: SIZES.xs,
  },
});

export default TextField;
