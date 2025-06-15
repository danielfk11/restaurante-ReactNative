import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, Button, FAB, Dialog, Portal, TextInput, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RestaurantService, TableService } from '../../services/database';
import { Restaurant, Table } from '../../types';
import { RootStackParamList } from '../../navigation/types';

type TableManagementScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TableManagement'>;
  route: RouteProp<RootStackParamList, 'TableManagement'>;
};

const TableManagementScreen: React.FC<TableManagementScreenProps> = ({ navigation, route }) => {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [restaurantData, tablesData] = await Promise.all([
        RestaurantService.getById(restaurantId),
        TableService.getByRestaurantId(restaurantId),
      ]);

      if (!restaurantData) {
        throw new Error('Restaurante não encontrado');
      }

      setRestaurant(restaurantData);
      setTables(tablesData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateTable = () => {
    if (!tableNumber.trim()) {
      setError('Número da mesa é obrigatório');
      return false;
    }
    if (!capacity.trim()) {
      setError('Capacidade é obrigatória');
      return false;
    }
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      setError('Capacidade deve ser um número positivo');
      return false;
    }
    if (tables.some(t => t.number === parseInt(tableNumber))) {
      setError('Já existe uma mesa com este número');
      return false;
    }
    return true;
  };

  const handleAddTable = async () => {
    if (!validateTable()) return;

    try {
      const newTable: Partial<Table> = {
        number: parseInt(tableNumber),
        capacity: parseInt(capacity),
        restaurantId,
        isAvailable: true,
      };

      await TableService.save(newTable);
      setDialogVisible(false);
      setTableNumber('');
      setCapacity('');
      setError('');
      loadData();
    } catch (err) {
      console.error('Erro ao adicionar mesa:', err);
      Alert.alert('Erro', 'Não foi possível adicionar a mesa. Tente novamente.');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta mesa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await TableService.delete(tableId);
              setTables(tables.filter(t => t.id !== tableId));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a mesa.');
            }
          },
        },
      ]
    );
  };

  const renderTableCard = ({ item }: { item: Table }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.tableNumber}>Mesa {item.number}</Text>
        <Text style={styles.tableCapacity}>Capacidade: {item.capacity} pessoas</Text>
        <Text style={[
          styles.tableStatus,
          { color: item.isAvailable ? '#4CAF50' : '#F44336' }
        ]}>
          {item.isAvailable ? 'Disponível' : 'Ocupada'}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => handleDeleteTable(item.id)}
          style={styles.deleteButton}
        >
          Excluir
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant?.name}</Text>
      <Text style={styles.subtitle}>Gerenciamento de Mesas</Text>

      <FlatList
        data={tables}
        renderItem={renderTableCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhuma mesa cadastrada. Adicione uma mesa usando o botão abaixo.
            </Text>
          </View>
        }
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Adicionar Mesa</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Número da Mesa"
              value={tableNumber}
              onChangeText={setTableNumber}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
            />
            <TextInput
              label="Capacidade"
              value={capacity}
              onChangeText={setCapacity}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
            />
            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleAddTable}>Adicionar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
        label="Adicionar Mesa"
      />
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tableCapacity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tableStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    borderColor: '#F44336',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
});

export default TableManagementScreen; 