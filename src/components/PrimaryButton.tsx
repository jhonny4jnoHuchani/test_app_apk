import { Button } from 'react-native-paper';
import { colors } from '../theme/colors';

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: string;
  icon?: string;
}

export function PrimaryButton({ onPress, loading, disabled, children, icon }: Props) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      buttonColor={colors.primary}
      textColor={colors.textInverse}
      style={{
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.ink,
        shadowColor: colors.ink,
        shadowOpacity: 0.25,
        shadowOffset: { width: 3, height: 3 },
        shadowRadius: 0,
        elevation: 3,
      }}
      contentStyle={{ paddingVertical: 7 }}
      labelStyle={{
        fontFamily: 'LilitaOne',
        fontWeight: '400',
        fontSize: 17,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </Button>
  );
}