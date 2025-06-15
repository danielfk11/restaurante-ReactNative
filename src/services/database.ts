import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Restaurant, Table, Customer, Reservation } from '../types';

// Chaves para o AsyncStorage
const STORAGE_KEYS = {
  USERS: '@users',
  RESTAURANTS: '@restaurants',
  TABLES: '@tables',
  CUSTOMERS: '@customers',
  RESERVATIONS: '@reservations',
};

// Função simples para gerar IDs únicos
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função auxiliar para salvar dados
const saveData = async (key: string, data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    throw error;
  }
};

// Função auxiliar para carregar dados
const loadData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    throw error;
  }
};

// Serviço de Usuários
export const UserService = {
  async getAll(): Promise<User[]> {
    return loadData(STORAGE_KEYS.USERS);
  },

  async getById(id: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(user => user.id === id) || null;
  },

  async getByEmail(email: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(user => user.email === email) || null;
  },

  async save(user: Partial<User>): Promise<User> {
    const users = await this.getAll();
    const now = new Date();

    if (user.id) {
      // Atualizar usuário existente
      const index = users.findIndex(u => u.id === user.id);
      if (index === -1) throw new Error('Usuário não encontrado');

      const updatedUser = {
        ...users[index],
        ...user,
        updatedAt: now,
      };
      users[index] = updatedUser;
      await saveData(STORAGE_KEYS.USERS, users);
      return updatedUser;
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: generateId(),
        ...user as Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
        createdAt: now,
        updatedAt: now,
      };
      users.push(newUser);
      await saveData(STORAGE_KEYS.USERS, users);
      return newUser;
    }
  },

  async delete(id: string): Promise<void> {
    const users = await this.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    await saveData(STORAGE_KEYS.USERS, filteredUsers);
  },
};

// Serviço de Restaurantes
export const RestaurantService = {
  async getAll(): Promise<Restaurant[]> {
    const restaurants = await AsyncStorage.getItem('restaurants');
    return restaurants ? JSON.parse(restaurants) : [];
  },

  async getById(id: string): Promise<Restaurant | null> {
    const restaurants = await this.getAll();
    return restaurants.find(r => r.id === id) || null;
  },

  async getByOwnerId(ownerId: string): Promise<Restaurant[]> {
    const restaurants = await this.getAll();
    return restaurants.filter(r => r.ownerId === ownerId);
  },

  async save(restaurant: Partial<Restaurant>): Promise<Restaurant> {
    const restaurants = await this.getAll();
    const newRestaurant: Restaurant = {
      id: restaurant.id || generateId(),
      name: restaurant.name!,
      address: restaurant.address!,
      phone: restaurant.phone!,
      email: restaurant.email!,
      ownerId: restaurant.ownerId!,
      createdAt: restaurant.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const existingIndex = restaurants.findIndex(r => r.id === newRestaurant.id);
    if (existingIndex >= 0) {
      restaurants[existingIndex] = newRestaurant;
    } else {
      restaurants.push(newRestaurant);
    }

    await AsyncStorage.setItem('restaurants', JSON.stringify(restaurants));
    return newRestaurant;
  },

  async update(restaurant: Restaurant): Promise<Restaurant> {
    return this.save(restaurant);
  },

  async delete(id: string): Promise<void> {
    const restaurants = await this.getAll();
    const filtered = restaurants.filter(r => r.id !== id);
    await AsyncStorage.setItem('restaurants', JSON.stringify(filtered));
  },
};

// Serviço de Mesas
export const TableService = {
  async getAll(): Promise<Table[]> {
    const tables = await AsyncStorage.getItem('tables');
    return tables ? JSON.parse(tables) : [];
  },

  async getById(id: string): Promise<Table | null> {
    const tables = await this.getAll();
    return tables.find(t => t.id === id) || null;
  },

  async getByRestaurantId(restaurantId: string): Promise<Table[]> {
    const tables = await this.getAll();
    return tables.filter(t => t.restaurantId === restaurantId);
  },

  async save(table: Partial<Table>): Promise<Table> {
    const tables = await this.getAll();
    const newTable: Table = {
      id: table.id || generateId(),
      number: table.number!,
      capacity: table.capacity!,
      restaurantId: table.restaurantId!,
      isAvailable: table.isAvailable ?? true,
      createdAt: table.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const existingIndex = tables.findIndex(t => t.id === newTable.id);
    if (existingIndex >= 0) {
      tables[existingIndex] = newTable;
    } else {
      tables.push(newTable);
    }

    await AsyncStorage.setItem('tables', JSON.stringify(tables));
    return newTable;
  },

  async update(table: Table): Promise<Table> {
    return this.save(table);
  },

  async delete(id: string): Promise<void> {
    const tables = await this.getAll();
    const filtered = tables.filter(t => t.id !== id);
    await AsyncStorage.setItem('tables', JSON.stringify(filtered));
  },

  async updateAvailability(id: string, isAvailable: boolean): Promise<Table> {
    const tables = await this.getAll();
    const tableIndex = tables.findIndex(t => t.id === id);
    if (tableIndex === -1) {
      throw new Error('Mesa não encontrada');
    }

    const updatedTable = {
      ...tables[tableIndex],
      isAvailable,
      updatedAt: new Date(),
    };

    tables[tableIndex] = updatedTable;
    await AsyncStorage.setItem('tables', JSON.stringify(tables));
    return updatedTable;
  },
};

// Serviço de Clientes
export const CustomerService = {
  async getAll(): Promise<Customer[]> {
    return loadData(STORAGE_KEYS.CUSTOMERS);
  },

  async getById(id: string): Promise<Customer | null> {
    const customers = await this.getAll();
    return customers.find(customer => customer.id === id) || null;
  },

  async getByEmail(email: string): Promise<Customer | null> {
    const customers = await this.getAll();
    return customers.find(customer => customer.email === email) || null;
  },

  async save(customer: Partial<Customer>): Promise<Customer> {
    const customers = await this.getAll();
    const now = new Date();

    if (customer.id) {
      // Atualizar cliente existente
      const index = customers.findIndex(c => c.id === customer.id);
      if (index === -1) throw new Error('Cliente não encontrado');

      const updatedCustomer = {
        ...customers[index],
        ...customer,
        updatedAt: now,
      };
      customers[index] = updatedCustomer;
      await saveData(STORAGE_KEYS.CUSTOMERS, customers);
      return updatedCustomer;
    } else {
      // Criar novo cliente
      const newCustomer: Customer = {
        id: generateId(),
        ...customer as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
        createdAt: now,
        updatedAt: now,
      };
      customers.push(newCustomer);
      await saveData(STORAGE_KEYS.CUSTOMERS, customers);
      return newCustomer;
    }
  },

  async delete(id: string): Promise<void> {
    const customers = await this.getAll();
    const filteredCustomers = customers.filter(customer => customer.id !== id);
    await saveData(STORAGE_KEYS.CUSTOMERS, filteredCustomers);
  },
};

// Serviço de Reservas
export const ReservationService = {
  async getAll(): Promise<Reservation[]> {
    return loadData(STORAGE_KEYS.RESERVATIONS);
  },

  async getById(id: string): Promise<Reservation | null> {
    const reservations = await this.getAll();
    return reservations.find(reservation => reservation.id === id) || null;
  },

  async getByRestaurantId(restaurantId: string): Promise<Reservation[]> {
    const reservations = await this.getAll();
    return reservations.filter(reservation => reservation.restaurantId === restaurantId);
  },

  async getByCustomerId(customerId: string): Promise<Reservation[]> {
    const reservations = await this.getAll();
    return reservations.filter(reservation => reservation.customerId === customerId);
  },

  async save(reservation: Partial<Reservation>): Promise<Reservation> {
    const reservations = await this.getAll();
    const now = new Date();

    if (reservation.id) {
      // Atualizar reserva existente
      const index = reservations.findIndex(r => r.id === reservation.id);
      if (index === -1) throw new Error('Reserva não encontrada');

      const updatedReservation = {
        ...reservations[index],
        ...reservation,
        updatedAt: now,
      };
      reservations[index] = updatedReservation;
      await saveData(STORAGE_KEYS.RESERVATIONS, reservations);
      return updatedReservation;
    } else {
      // Criar nova reserva
      const newReservation: Reservation = {
        id: generateId(),
        ...reservation as Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>,
        createdAt: now,
        updatedAt: now,
      };
      reservations.push(newReservation);
      await saveData(STORAGE_KEYS.RESERVATIONS, reservations);
      return newReservation;
    }
  },

  async delete(id: string): Promise<void> {
    const reservations = await this.getAll();
    const filteredReservations = reservations.filter(reservation => reservation.id !== id);
    await saveData(STORAGE_KEYS.RESERVATIONS, filteredReservations);
  },
}; 