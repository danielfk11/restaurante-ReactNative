import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton, MD3Colors } from 'react-native-paper';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Restaurant Screens
import RestaurantListScreen from '../screens/restaurant/RestaurantListScreen';
import AddRestaurantScreen from '../screens/restaurant/AddRestaurantScreen';
import RestaurantDetailsScreen from '../screens/restaurant/RestaurantDetailsScreen';
import TableManagementScreen from '../screens/restaurant/TableManagementScreen';
import EditRestaurantScreen from '../screens/restaurant/EditRestaurantScreen';

// Reservation Screens
import ReservationsScreen from '../screens/reservation/ReservationsScreen';
import NewReservationScreen from '../screens/reservation/NewReservationScreen';

// Types
import { User } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddRestaurant: undefined;
  RestaurantDetails: { restaurantId: string };
  TableManagement: { restaurantId: string };
  NewReservation: { restaurantId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Restaurants: undefined;
  Reservations: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = route.name === 'Restaurants' ? 'store' : 'calendar-clock';
          return (
            <IconButton
              icon={iconName}
              size={size}
              iconColor={color}
              style={{ margin: 0 }}
            />
          );
        },
        tabBarActiveTintColor: MD3Colors.primary40,
        tabBarInactiveTintColor: MD3Colors.neutral60,
      })}
    >
      <MainTab.Screen
        name="Restaurants"
        component={RestaurantListScreen}
        options={{
          title: 'Restaurantes',
          headerShown: false,
        }}
      />
      <MainTab.Screen
        name="Reservations"
        component={ReservationsScreen}
        options={{
          title: 'Reservas',
          headerShown: false,
        }}
      />
    </MainTab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen
          name="AddRestaurant"
          component={AddRestaurantScreen}
          options={{
            headerShown: true,
            title: 'Novo Restaurante',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="RestaurantDetails"
          component={RestaurantDetailsScreen}
          options={{
            headerShown: true,
            title: 'Detalhes do Restaurante',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="EditRestaurant"
          component={EditRestaurantScreen}
          options={{
            headerShown: true,
            title: 'Editar Restaurante',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="TableManagement"
          component={TableManagementScreen}
          options={{
            headerShown: true,
            title: 'Gerenciar Mesas',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="NewReservation"
          component={NewReservationScreen}
          options={{
            headerShown: true,
            title: 'Nova Reserva',
            headerBackTitle: 'Voltar',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 