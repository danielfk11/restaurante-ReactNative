import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReservationService, RestaurantService, CustomerService, TableService } from '../../services/database';
import { Reservation, Restaurant, Customer, Table, ReservationStatus } from '../../types';

type ReservationsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const ReservationsScreen: React.FC<ReservationsScreenProps> = ({ navigation }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [restaurants, setRestaurants] = useState<{ [key: string]: Restaurant }>({});
  const [customers, setCustomers] = useState<{ [key: string]: Customer }>({});
  const [tables, setTables] = useState<{ [key: string]: Table }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = reservations.filter(reservation => {
        const restaurant = restaurants[reservation.restaurantId];
        const customer = customers[reservation.customerId];
        return (
          restaurant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer?.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredReservations(filtered);
    } else {
      setFilteredReservations(reservations);
    }
  }, [searchQuery, reservations, restaurants, customers]);

  const loadData = async () => {
    try {
      const [
        reservationsData,
        restaurantsData,
        customersData,
        tablesData
      ] = await Promise.all([
        ReservationService.getAll(),
        RestaurantService.getAll(),
        CustomerService.getAll(),
        TableService.getAll()
      ]);

      // Converter arrays em objetos para acesso rápido
      const restaurantsMap = restaurantsData.reduce((acc, restaurant) => {
        acc[restaurant.id] = restaurant;
        return acc;
      }, {} as { [key: string]: Restaurant });

      const customersMap = customersData.reduce((acc, customer) => {
        acc[customer.id] = customer;
        return acc;
      }, {} as { [key: string]: Customer });

      const tablesMap = tablesData.reduce((acc, table) => {
        acc[table.id] = table;
        return acc;
      }, {} as { [key: string]: Table });

      setReservations(reservationsData);
      setFilteredReservations(reservationsData);
      setRestaurants(restaurantsMap);
      setCustomers(customersMap);
      setTables(tablesMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return '#FFA000';
      case ReservationStatus.CONFIRMED:
        return '#4CAF50';
      case ReservationStatus.CANCELLED:
        return '#F44336';
      case ReservationStatus.COMPLETED:
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'Pendente';
      case ReservationStatus.CONFIRMED:
        return 'Confirmada';
      case ReservationStatus.CANCELLED:
        return 'Cancelada';
      case ReservationStatus.COMPLETED:
        return 'Concluída';
      default:
        return status;
    }
  };

  const renderReservationCard = ({ item }: { item: Reservation }) => {
    const restaurant = restaurants[item.restaurantId];
    const customer = customers[item.customerId];
    const table = tables[item.tableId];

    if (!restaurant || !customer || !table) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{customer.name}</Text>
            <Text style={styles.subValue}>{customer.email}</Text>
            <Text style={styles.subValue}>{customer.phone}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Detalhes da Reserva</Text>
            <Text style={styles.value}>Mesa {table.number}</Text>
            <Text style={styles.subValue}>
              {item.numberOfGuests} {item.numberOfGuests === 1 ? 'pessoa' : 'pessoas'}
            </Text>
            <Text style={styles.subValue}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button
            onPress={() => navigation.navigate('ReservationDetails', { reservationId: item.id })}
          >
            Ver Detalhes
          </Button>
          {item.status === ReservationStatus.PENDING && (
            <Button
              mode="contained"
              onPress={() => handleUpdateStatus(item.id, ReservationStatus.CONFIRMED)}
            >
              Confirmar
            </Button>
          )}
          {item.status === ReservationStatus.PENDING && (
            <Button
              mode="outlined"
              textColor="#F44336"
              onPress={() => handleUpdateStatus(item.id, ReservationStatus.CANCELLED)}
            >
              Cancelar
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      const updatedReservation = {
        ...reservation,
        status: newStatus,
        updatedAt: new Date(),
      };

      await ReservationService.save(updatedReservation);

      // Se a reserva for cancelada, liberar a mesa
      if (newStatus === ReservationStatus.CANCELLED) {
        const table = tables[reservation.tableId];
        if (table) {
          const updatedTable = { ...table, isAvailable: true };
          await TableService.save(updatedTable);
          setTables({ ...tables, [table.id]: updatedTable });
        }
      }

      // Atualizar a lista de reservas
      const updatedReservations = reservations.map(r =>
        r.id === reservationId ? updatedReservation : r
      );
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar reservas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredReservations}
        renderItem={renderReservationCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Nenhuma reserva encontrada com esses termos.'
                : 'Nenhuma reserva encontrada.'}
            </Text>
          </View>
        }
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
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
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
    fontWeight: 'bold',
  },
  subValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
});

export default ReservationsScreen; 