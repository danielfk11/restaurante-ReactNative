import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ReservationService, RestaurantService, TableService, CustomerService } from '../../services/database';
import { Restaurant, Table, Customer, Reservation, ReservationStatus } from '../../types';

type NewReservationScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, 'NewReservation'>;
};

const NewReservationScreen: React.FC<NewReservationScreenProps> = ({ navigation, route }) => {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      const [restaurantData, tablesData] = await Promise.all([
        RestaurantService.getAll().then(restaurants => 
          restaurants.find(r => r.id === restaurantId)
        ),
        TableService.getByRestaurant(restaurantId)
      ]);

      if (restaurantData) {
        setRestaurant(restaurantData);
      }
      setTables(tablesData.filter(table => table.isAvailable));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do restaurante.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!selectedTable) {
      setError('Selecione uma mesa');
      return false;
    }
    if (!numberOfGuests.trim()) {
      setError('Número de convidados é obrigatório');
      return false;
    }
    const guests = parseInt(numberOfGuests);
    if (isNaN(guests) || guests <= 0) {
      setError('Número de convidados deve ser positivo');
      return false;
    }
    if (guests > selectedTable.capacity) {
      setError(`A mesa selecionada suporta apenas ${selectedTable.capacity} pessoas`);
      return false;
    }
    if (!customerName.trim()) {
      setError('Nome do cliente é obrigatório');
      return false;
    }
    if (!customerEmail.trim()) {
      setError('Email do cliente é obrigatório');
      return false;
    }
    if (!customerEmail.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (!customerPhone.trim()) {
      setError('Telefone do cliente é obrigatório');
      return false;
    }
    return true;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      // Criar ou atualizar cliente
      const customers = await CustomerService.getAll();
      let customer = customers.find(c => c.email === customerEmail);

      if (!customer) {
        customer = {
          id: Date.now().toString(),
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await CustomerService.save(customer);
      }

      // Criar reserva
      const reservation: Reservation = {
        id: Date.now().toString(),
        restaurantId,
        customerId: customer.id,
        tableId: selectedTable!.id,
        date,
        numberOfGuests: parseInt(numberOfGuests),
        status: ReservationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ReservationService.save(reservation);

      // Atualizar status da mesa
      const updatedTable = { ...selectedTable!, isAvailable: false };
      await TableService.save(updatedTable);

      Alert.alert(
        'Sucesso',
        'Reserva realizada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setError('Erro ao criar reserva. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text>Restaurante não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{restaurant.name}</Text>
          <Text style={styles.subtitle}>Nova Reserva</Text>

          <Text style={styles.label}>Data e Hora</Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            {date.toLocaleString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Número de Convidados</Text>
          <TextInput
            value={numberOfGuests}
            onChangeText={setNumberOfGuests}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Selecione uma Mesa</Text>
          <View style={styles.tableGrid}>
            {tables.map(table => (
              <Card
                key={table.id}
                style={[
                  styles.tableCard,
                  selectedTable?.id === table.id && styles.selectedTableCard
                ]}
                onPress={() => setSelectedTable(table)}
              >
                <Card.Content>
                  <Text style={styles.tableNumber}>Mesa {table.number}</Text>
                  <Text style={styles.tableCapacity}>
                    Capacidade: {table.capacity} pessoas
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Dados do Cliente</Text>

          <TextInput
            label="Nome do Cliente"
            value={customerName}
            onChangeText={setCustomerName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={customerEmail}
            onChangeText={setCustomerEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Telefone"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
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
            loading={saving}
            disabled={saving}
          >
            Confirmar Reserva
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={saving}
          >
            Cancelar
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tableCard: {
    width: '48%',
    marginBottom: 16,
  },
  selectedTableCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableCapacity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default NewReservationScreen; 