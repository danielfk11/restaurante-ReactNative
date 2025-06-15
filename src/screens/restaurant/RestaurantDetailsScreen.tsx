import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RestaurantService, TableService } from '../../services/database';
import { Restaurant, Table } from '../../types';
import { RootStackParamList } from '../../navigation/types';

type RestaurantDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RestaurantDetails'>;
  route: RouteProp<RootStackParamList, 'RestaurantDetails'>;
};

const RestaurantDetailsScreen: React.FC<RestaurantDetailsScreenProps> = ({ navigation, route }) => {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      const [restaurantData, tablesData] = await Promise.all([
        RestaurantService.getById(restaurantId),
        TableService.getByRestaurantId(restaurantId)
      ]);

      if (restaurantData) {
        setRestaurant(restaurantData);
      }
      setTables(tablesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do restaurante.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este restaurante? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await RestaurantService.delete(restaurantId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o restaurante.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
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
          <View style={styles.header}>
            <Text style={styles.title}>{restaurant.name}</Text>
            <IconButton
              icon="pencil"
              size={24}
              onPress={() => navigation.navigate('EditRestaurant', { restaurantId })}
            />
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.label}>Endereço</Text>
            <Text style={styles.value}>{restaurant.address}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.value}>{restaurant.phone}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{restaurant.email}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Mesas</Text>
            <Text style={styles.value}>
              {tables.length} {tables.length === 1 ? 'mesa' : 'mesas'} cadastradas
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Mesas Disponíveis</Text>
          {tables.length > 0 ? (
            tables.map(table => (
              <View key={table.id} style={styles.tableItem}>
                <Text style={styles.tableNumber}>Mesa {table.number}</Text>
                <Text style={styles.tableCapacity}>
                  Capacidade: {table.capacity} pessoas
                </Text>
                <Text style={[
                  styles.tableStatus,
                  { color: table.isAvailable ? '#4CAF50' : '#F44336' }
                ]}>
                  {table.isAvailable ? 'Disponível' : 'Ocupada'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma mesa cadastrada</Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('TableManagement', { restaurantId })}
          style={styles.button}
        >
          Gerenciar Mesas
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('NewReservation', { restaurantId })}
          style={styles.button}
        >
          Nova Reserva
        </Button>

        <Button
          mode="outlined"
          onPress={handleDeleteRestaurant}
          style={[styles.button, styles.deleteButton]}
          textColor="#F44336"
        >
          Excluir Restaurante
        </Button>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  infoSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tableItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  tableStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
});

export default RestaurantDetailsScreen; 