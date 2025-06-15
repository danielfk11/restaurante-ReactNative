import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RestaurantService } from '../../services/database';
import { Restaurant } from '../../types';
import { RootStackParamList } from '../../navigation/types';

type EditRestaurantScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditRestaurant'>;
  route: RouteProp<RootStackParamList, 'EditRestaurant'>;
};

const EditRestaurantScreen: React.FC<EditRestaurantScreenProps> = ({ navigation, route }) => {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRestaurant();
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      const data = await RestaurantService.getById(restaurantId);
      if (data) {
        setRestaurant(data);
        setName(data.name);
        setAddress(data.address);
        setPhone(data.phone);
        setEmail(data.email);
      }
    } catch (err) {
      console.error('Erro ao carregar restaurante:', err);
      setError('Erro ao carregar dados do restaurante');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!address.trim()) {
      setError('Endereço é obrigatório');
      return false;
    }
    if (!phone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }
    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const updatedRestaurant: Restaurant = {
        ...restaurant!,
        name,
        address,
        phone,
        email,
        updatedAt: new Date(),
      };

      await RestaurantService.update(updatedRestaurant);
      Alert.alert('Sucesso', 'Restaurante atualizado com sucesso!');
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao atualizar restaurante:', err);
      setError('Erro ao atualizar restaurante. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TextInput
            label="Nome do Restaurante"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Endereço"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={saving}
            disabled={saving}
          >
            Salvar Alterações
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={saving}
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default EditRestaurantScreen; 