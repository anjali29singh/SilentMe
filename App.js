import {
  Button,
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Location from "expo-location";
import { useState } from "react";
import * as TaskManager from "expo-task-manager";
import { hello } from "./modules/my-module";

export default function App() {
  const LOCATION_TASK_NAME = "background-location-task";
  const GEOFENCING_TASK_NAME = "background-geofencing-task";
  const [location, setLocation] = useState(null);
  const getPermission = async () => {
    let { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus === "granted") {
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === "granted") {
        const x = await Location.getCurrentPositionAsync({});
        setLocation(x.coords);
        startBackgroundTracking();
        geofence();
      }
    }
  };

  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, err }) => {
    if (err) {
      console.error(err);
    }
    if (data) {
      const { locations } = data;
    }
  });

  TaskManager.defineTask(GEOFENCING_TASK_NAME, ({ data, err }) => {
    const { eventType, region } = data;
    if (err) {
      console.error(err);
    }
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log("you have entered into region", region);
      //silent android
    } else if (eventType === Location.GeofencingEventType.Exit) {
      console.log("you have exited from region");

      //remove from silent mode
    }
  });
  const startBackgroundTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 10,
      showsBackgroundLocationIndicator: true,
    });
  };

  const geofence = async () => {
    const lat = location.latitude;
    const long = location.longitude;
    const geofenceRegion = {
      latitude: lat,
      longitude: long,
      radius: 1000,
      notifyOnEnter: true,
      notifyOnExit: true,
    };
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, [geofenceRegion]);
  };
  return (
    <View style={{ margin: 23 }}>
      <Text>Silent Me</Text>
      <hello />
      <Button title="Click Me" onPress={getPermission} />
    </View>
  );
}
