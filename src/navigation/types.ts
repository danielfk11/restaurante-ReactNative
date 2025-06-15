import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddRestaurant: undefined;
  RestaurantDetails: { restaurantId: string };
  TableManagement: { restaurantId: string };
  NewReservation: { restaurantId: string };
  EditRestaurant: { restaurantId: string };
};

export type MainTabParamList = {
  Restaurants: undefined;
  Reservations: undefined;
};

export type RestaurantStackParamList = {
  RestaurantList: undefined;
  RestaurantDetails: { restaurantId: string };
  AddRestaurant: undefined;
  EditRestaurant: { restaurantId: string };
  TableManagement: { restaurantId: string };
};

export type ReservationStackParamList = {
  ReservationList: undefined;
  ReservationDetails: { reservationId: string };
  NewReservation: { restaurantId: string };
}; 