import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantService, UserService } from '../../services/database';
import { Restaurant, UserRole } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AddRestaurantScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const AddRestaurantScreen: React.FC<AddRestaurantScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('@current_user');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user.role !== UserRole.RESTAURANT_OWNER) {
          setError('Apenas proprietários podem adicionar restaurantes');
          navigation.goBack();
        }
        setCurrentUser(user);
      } else {
        setError('Usuário não encontrado');
        navigation.goBack();
      }
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      setError('Erro ao carregar dados do usuário');
      navigation.goBack();
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
    if (!currentUser) {
      setError('Usuário não encontrado');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const newRestaurant = {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        ownerId: currentUser.id,
      };

      await RestaurantService.save(newRestaurant);
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao salvar restaurante:', err);
      setError('Erro ao salvar restaurante. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Novo Restaurante</Text>
          <Text style={styles.subtitle}>Preencha os dados do restaurante</Text>

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
            multiline
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

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Salvar
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={loading}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default AddRestaurantScreen; 