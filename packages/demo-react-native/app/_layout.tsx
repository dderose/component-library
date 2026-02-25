import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: "600" },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: { backgroundColor: Colors.surface },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "Home", tabBarLabel: "Home" }}
        />
        <Tabs.Screen
          name="text-field"
          options={{ title: "TextField", tabBarLabel: "TextField" }}
        />
        <Tabs.Screen
          name="checkbox"
          options={{ title: "Checkbox", tabBarLabel: "Checkbox" }}
        />
        <Tabs.Screen
          name="radio-group"
          options={{ title: "RadioGroup", tabBarLabel: "Radio" }}
        />
        <Tabs.Screen
          name="select"
          options={{ title: "Select", tabBarLabel: "Select" }}
        />
        <Tabs.Screen
          name="multi-select"
          options={{ title: "MultiSelect", tabBarLabel: "Multi" }}
        />
        <Tabs.Screen
          name="accordion"
          options={{ title: "Accordion", tabBarLabel: "Accordion" }}
        />
      </Tabs>
    </>
  );
}
