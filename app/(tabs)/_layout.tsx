import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/components/Colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  focused,
  iconOn,
  iconOff,
  label,
}: {
  focused: boolean;
  iconOn: IoniconName;
  iconOff: IoniconName;
  label: string;
}) {
  const color = focused ? Colors.tabBarActive : Colors.tabBarInactive;
  return (
    <View style={styles.tabItem}>
      <Ionicons name={focused ? iconOn : iconOff} size={22} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
}

function AddTabIcon() {
  return (
    <View style={styles.addWrapper}>
      <View style={styles.addCircle}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconOn="home" iconOff="home-outline" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="timers"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconOn="timer" iconOff="timer-outline" label="Timers" />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => <AddTabIcon />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              iconOn="calendar"
              iconOff="calendar-outline"
              label="Activity"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              iconOn="person"
              iconOff="person-outline"
              label="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  addWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  addCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
});
