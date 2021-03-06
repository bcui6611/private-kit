import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import BackgroundImage from './../../assets/images/launchScreenBackground.png';
import languages from '../../locales/languages';
import ButtonWrapper from '../../components/ButtonWrapper';
import Colors from '../../constants/colors';
import IconDenied from '../../assets/svgs/permissionDenied';
import IconGranted from '../../assets/svgs/permissionGranted';
import IconUnknown from '../../assets/svgs/permissionUnknown';
import { SetStoreData } from '../../helpers/General';
import { isPlatformiOS } from './../../Util';
import { SvgXml } from 'react-native-svg';
import fontFamily from '../../constants/fonts';
import { PARTICIPATE } from '../../constants/storage';

const width = Dimensions.get('window').width;

const PermissionStatusEnum = {
  UNKNOWN: 0,
  GRANTED: 1,
  DENIED: 2,
};

const PermissionDescription = ({ title, status, ...props }) => {
  let icon;
  switch (status) {
    case PermissionStatusEnum.UNKNOWN:
      icon = IconUnknown;
      break;
    case PermissionStatusEnum.GRANTED:
      icon = IconGranted;
      break;
    case PermissionStatusEnum.DENIED:
      icon = IconDenied;
      break;
  }
  return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <SvgXml style={styles.permissionIcon} xml={icon} width={30} height={30} />
    </View>
  );
};

class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notificationPermission: PermissionStatusEnum.UNKNOWN,
      locationPermission: PermissionStatusEnum.UNKNOWN,
      bluetoothPermission: PermissionStatusEnum.UNKNOWN,
    };
    this.checkLocationStatus();
    this.checkNotificationStatus();
  }

  isLocationChecked() {
    return this.state.locationPermission !== PermissionStatusEnum.UNKNOWN;
  }

  isNotificationChecked() {
    return this.state.notificationPermission !== PermissionStatusEnum.UNKNOWN;
  }

  isBLEChecked() {
    return this.state.bluetoothPermission !== PermissionStatusEnum.UNKNOWN;
  }

  checkLocationStatus() {
    // NEED TO TEST ON ANNDROID
    let locationPermission;
    if (isPlatformiOS()) {
      locationPermission = PERMISSIONS.IOS.LOCATION_ALWAYS;
    } else {
      locationPermission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }
    check(locationPermission)
      .then(result => {
        switch (result) {
          case RESULTS.GRANTED:
            this.setState({
              locationPermission: PermissionStatusEnum.GRANTED,
            });
            break;
          case RESULTS.UNAVAILABLE:
          case RESULTS.BLOCKED:
            this.setState({
              locationPermission: PermissionStatusEnum.DENIED,
            });
            break;
        }
      })
      .catch(error => {
        console.log('error checking location: ' + error);
      });
  }

  checkBLEStatus() {
    if (isPlatformiOS()) {
      this.setState({
        bluetoothPermission: PermissionStatusEnum.UNKNOWN,
      })
    }
    else {
      this.setState({
        bluetoothPermission: PermissionStatusEnum.UNKNOWN,
      })
    }
  }

  checkNotificationStatus() {
    checkNotifications().then(({ status }) => {
      switch (status) {
        case RESULTS.GRANTED:
          this.setState({
            notificationPermission: PermissionStatusEnum.GRANTED,
          });
          break;
        case RESULTS.UNAVAILABLE:
        case RESULTS.BLOCKED:
          this.setState({
            notificationPermission: PermissionStatusEnum.DENIED,
          });
          break;
      }
    });
  }

  requestBLE () {
    this.setState({
      bluetoothPermission: PermissionStatusEnum.GRANTED,
    })
  }

  requestLocation() {
    // NEED TO TEST ON ANNDROID
    let locationPermission;
    if (isPlatformiOS()) {
      locationPermission = PERMISSIONS.IOS.LOCATION_ALWAYS;
    } else {
      locationPermission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }
    request(locationPermission).then(result => {
      switch (result) {
        case RESULTS.GRANTED:
          console.log('Location granted');
          this.setState({
            locationPermission: PermissionStatusEnum.GRANTED,
          });
          break;
        case RESULTS.UNAVAILABLE:
        case RESULTS.BLOCKED:
          this.setState({
            locationPermission: PermissionStatusEnum.DENIED,
          });
          break;
      }
    });
  }

  requestNotification() {
    requestNotifications(['alert', 'badge', 'sound']).then(({ status }) => {
      switch (status) {
        case RESULTS.GRANTED:
          this.setState({
            notificationPermission: PermissionStatusEnum.GRANTED,
          });
          break;
        case RESULTS.UNAVAILABLE:
        case RESULTS.BLOCKED:
          this.setState({
            notificationPermission: PermissionStatusEnum.DENIED,
          });
          break;
      }
    });
  }

  buttonPressed() {
    if (!this.isLocationChecked()) {
      this.requestLocation();
    } else if (!this.isNotificationChecked()) {
      this.requestNotification();
    } else if (!this.isBLEChecked()) {
      this.requestBLE();
    } else {
      SetStoreData(PARTICIPATE, 'true'); // replaces "start" button
      this.props.navigation.replace('LocationTrackingScreen');
    }
  }

  getTitleText() {
    if (!this.isLocationChecked()) {
      return languages.t('label.launch_location_header');
    } else if (!this.isNotificationChecked()) {
      return languages.t('label.launch_notif_header');
    } else if (!this.isBLEChecked()) {
      return languages.t('label.launch_bluetooth_header');
    } else {
      return languages.t('label.launch_done_header');
    }
  }

  getTitleTextView() {
    if (!this.isLocationChecked() || !this.isNotificationChecked() || !this.isBLEChecked()) {
      return <Text style={styles.headerText}>{this.getTitleText()}</Text>;
    } else {
      return <Text style={styles.bigHeaderText}>{this.getTitleText()}</Text>;
    }
  }

  getSubtitleText() {
    if (!this.isLocationChecked()) {
      return languages.t('label.launch_location_subheader');
    } else if (!this.isNotificationChecked()) {
      return languages.t('label.launch_notif_subheader');
    } else {
      return languages.t('label.launch_done_subheader');
    }
  }

  getLocationPermission() {
    return (
      <>
        <View style={styles.divider}></View>
        <PermissionDescription
          title={languages.t('label.launch_location_access')}
          status={this.state.locationPermission}
        />
        <View style={styles.divider}></View>
      </>
    );
  }

  getNotificationsPermissionIfIOS() {
    if (isPlatformiOS()) {
      return (
        <>
          <PermissionDescription
            title={languages.t('label.launch_notification_access')}
            status={this.state.notificationPermission}
          />
          <View style={styles.divider}></View>
        </>
      );
    }
    return;
  }

  getBLEPermissions() {
    return (
      <>
        <PermissionDescription
          title={languages.t('label.launch_bluetooth_access')}
          status={this.state.bluetoothPermission}
        />
        <View style={styles.divider}></View>
      </>
    )
  }


  getButtonText() {
    if (!this.isLocationChecked()) {
      return languages.t('label.launch_enable_location');
    } else if (!this.isNotificationChecked()) {
      return languages.t('label.launch_enable_notif');
    } else if (!this.isBLEChecked()) {
      return languages.t('label.launch_enable_ble');
    } else {
      return languages.t('label.launch_finish_set_up');
    }
  }

  render() {
    return (
      <ImageBackground source={BackgroundImage} style={styles.backgroundImage}>
        <StatusBar
          barStyle='light-content'
          backgroundColor='transparent'
          translucent={true}
        />

        <View style={styles.mainContainer}>
          <View style={styles.contentContainer}>
            {this.getTitleTextView()}
            <Text style={styles.subheaderText}>{this.getSubtitleText()}</Text>
            <View style={styles.statusContainer}>
              {this.getLocationPermission()}
              {this.getNotificationsPermissionIfIOS()}
              {this.getBLEPermissions()}
              <View style={styles.spacer}></View>
            </View>
          </View>
          <View style={styles.footerContainer}>
            <ButtonWrapper
              title={this.getButtonText()}
              onPress={this.buttonPressed.bind(this)}
              buttonColor={Colors.VIOLET}
              bgColor={Colors.WHITE}
            />
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    width: width * 0.9,
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  bigHeaderText: {
    color: Colors.WHITE,
    fontSize: 52,
    lineHeight: 48.5,
    paddingTop: 52 - 48.5, // lineHeight hack
    width: width * 0.7,
    fontFamily: fontFamily.primaryMedium,
  },
  headerText: {
    color: Colors.WHITE,
    fontSize: 26,
    width: width * 0.8,
    fontFamily: fontFamily.primaryMedium,
  },
  subheaderText: {
    marginTop: '3%',
    color: Colors.WHITE,
    fontSize: 15,
    width: width * 0.55,
    fontFamily: fontFamily.primaryRegular,
  },
  statusContainer: {
    marginTop: '5%',
  },
  divider: {
    backgroundColor: Colors.DIVIDER,
    height: 1,
    marginVertical: '3%',
  },
  spacer: {
    marginVertical: '5%',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    marginBottom: '10%',
    alignSelf: 'center',
  },
  permissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  permissionTitle: {
    color: Colors.WHITE,
    fontSize: 16,
    alignSelf: 'center',
    fontFamily: fontFamily.primaryRegular,
  },
  permissionIcon: {
    alignSelf: 'center',
  },
});

export default Onboarding;
