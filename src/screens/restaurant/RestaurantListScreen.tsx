import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, Searchbar, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Restaurant } from '../../types';
import { RestaurantService, TableService } from '../../services/database';
import { useFocusEffect } from '@react-navigation/native';

type RestaurantWithTables = Restaurant & {
  tableCount: number;
  availableTables: number;
};

type RestaurantListScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const RestaurantListScreen: React.FC<RestaurantListScreenProps> = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState<RestaurantWithTables[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithTables[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurants = async () => {
    try {
      const data = await RestaurantService.getAll();
      // Carregar mesas para cada restaurante
      const restaurantsWithTables: RestaurantWithTables[] = await Promise.all(
        data.map(async (restaurant) => {
          const tables = await TableService.getByRestaurantId(restaurant.id);
          return {
            ...restaurant,
            tableCount: tables.length,
            availableTables: tables.filter(table => table.isAvailable).length,
          };
        })
      );
      setRestaurants(restaurantsWithTables);
      setFilteredRestaurants(restaurantsWithTables);
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Atualizar a lista quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, [])
  );

  useEffect(() => {
    if (searchQuery) {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [searchQuery, restaurants]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRestaurants();
  };

  const renderRestaurantCard = ({ item }: { item: RestaurantWithTables }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}>
      <Card.Content>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantAddress}>{item.address}</Text>
        <Text style={styles.restaurantPhone}>{item.phone}</Text>
        <Text style={styles.tableCount}>
          {item.availableTables} de {item.tableCount} {item.tableCount === 1 ? 'mesa' : 'mesas'} disponíveis
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}>
          Ver Detalhes
        </Button>
        <Button onPress={() => navigation.navigate('NewReservation', { restaurantId: item.id })}>
          Reservar
        </Button>
      </Card.Actions>
    </Card>
  );

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
        placeholder="Buscar restaurantes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Nenhum restaurante encontrado com esses termos.'
                : 'Nenhum restaurante cadastrado.'}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddRestaurant')}
        label="Novo Restaurante"
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
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  restaurantPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tableCount: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 8,
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
});

export default RestaurantListScreen; 