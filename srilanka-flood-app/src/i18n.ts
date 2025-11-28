// Language translations
export type Language = 'en' | 'si'

export interface Translations {
  // Dashboard
  dashboard: {
    title: string
    subtitle: string
    refresh: string
    requestHelp: string
    emergency: string
  }
  sidebar: {
    overview: string
    disasterCenters: string
    helpRequests: string
    requestHelp: string
    createCenter: string
    emergencyContact: string
  }
  stats: {
    totalCenters: string
    activeCenters: string
    limitedCapacity: string
    totalCapacity: string
  }
  map: {
    title: string
    active: string
    limited: string
    full: string
    helpRequests: string
    showOnlyRequests: string
    showAll: string
  }
  centers: {
    title: string
    search: string
    name: string
    location: string
    phone: string
    capacity: string
    status: string
    services: string
    additionalInfo: string
    actions: string
    viewOnMap: string
    call: string
    verified: string
    unverified: string
    verify: string
    unverify: string
    verificationStatus: string
  }
    requests: {
    title: string
    noRequests: string
    name: string
    phone: string
    location: string
    people: string
    needs: string
    additionalInfo: string
    call: string
    shareLocation: string
    verified: string
    unverified: string
    verify: string
    unverify: string
    verificationStatus: string
    verificationNotes: string
    verificationNotesPlaceholder: string
    verifyRequest: string
    cancel: string
    requestDetails: string
  }
  helpForm: {
    title: string
    subtitle: string
    name: string
    phone: string
    location: string
    numberOfPeople: string
    urgentNeeds: string
    shelter: string
    food: string
    medical: string
    clothing: string
    transportation: string
    additionalInfo: string
    submit: string
    success: string
    successMessage: string
    error: string
    errorMessage: string
    emergencyContact: string
    getLocation: string
    locationDetecting: string
    clickMap: string
    verificationImage: string
    locationError: string
    namePlaceholder: string
    phonePlaceholder: string
    numberOfPeoplePlaceholder: string
    additionalInfoPlaceholder: string
    urgencyLevel: string
    phoneInvalid: string
  }
  services: {
    Shelter: string
    Food: string
    Medical: string
    Clothing: string
    Transportation: string
  }
  createCenterForm: {
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    addressLabel: string
    addressPlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    phoneInvalid: string
    capacityLabel: string
    capacityPlaceholder: string
    statusLabel: string
    selectStatus: string
    servicesLabel: string
    selectAll: string
    locationOnMapLabel: string
    mapInstruction: string
    imageLabel: string
    additionalInfoLabel: string
    additionalInfoPlaceholder: string
    submitButton: string
    successTitle: string
    successMessage: string
    errorTitle: string
    errorMessage: string
    selectServicesAlert: string
    locationRequired: string
    locationError: string
  }
  status: {
    active: string
    limited: string
    full: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    dashboard: {
      title: 'Disaster Management Dashboard',
      subtitle: 'Real-time monitoring of flood relief centers',
      refresh: 'Refresh',
      requestHelp: 'Request Help',
      emergency: 'Emergency'
    },
    sidebar: {
      overview: 'Overview',
      disasterCenters: 'Disaster Centers',
      helpRequests: 'Help Requests',
      requestHelp: 'Request Help',
      createCenter: 'Create Center',
      emergencyContact: 'Emergency: 117'
    },
    stats: {
      totalCenters: 'Total Centers',
      activeCenters: 'Active Centers',
      limitedCapacity: 'Limited Capacity',
      totalCapacity: 'Total Capacity'
    },
    map: {
      title: 'Disaster Centers Map',
      active: 'Active',
      limited: 'Limited',
      full: 'Full',
      helpRequests: 'Help Requests',
      showOnlyRequests: 'Show Only Help Requests',
      showAll: 'Show All'
    },
    centers: {
      title: 'All Disaster Centers',
      search: 'Search centers...',
      name: 'Name',
      location: 'Location',
      phone: 'Phone',
      capacity: 'Capacity',
      status: 'Status',
      services: 'Services',
      additionalInfo: 'Additional Information',
      actions: 'Actions',
      viewOnMap: 'View on Map',
      call: 'Call',
      verified: 'Verified',
      unverified: 'Unverified',
      verify: 'Verify',
      unverify: 'Unverify',
      verificationStatus: 'Verification'
    },
    requests: {
      title: 'Recent Help Requests',
      noRequests: 'No help requests yet',
      name: 'Name',
      phone: 'Phone',
      location: 'Location',
      people: 'People',
      needs: 'Needs',
      additionalInfo: 'Additional Info',
      call: 'Call',
      shareLocation: 'Share Location',
      verified: 'Verified',
      unverified: 'Unverified',
      verify: 'Verify',
      unverify: 'Unverify',
      verificationStatus: 'Verification',
      verificationNotes: 'Verification Notes',
      verificationNotesPlaceholder: 'Add any notes about this verification (optional)',
      verifyRequest: 'Verify Request',
      cancel: 'Cancel',
      requestDetails: 'Request Details'
    },
    helpForm: {
      title: 'Sri Lanka Flood Disaster - Help Request',
      subtitle: 'If you are homeless due to the floods, please fill out this form to request assistance from the Disaster Center',
      name: 'Full Name',
      phone: 'Phone Number',
      location: 'Current Location',
      numberOfPeople: 'Number of People Needing Help',
      urgentNeeds: 'Urgent Needs (Select all that apply)',
      shelter: 'Emergency Shelter',
      food: 'Food & Water',
      medical: 'Medical Assistance',
      clothing: 'Clothing',
      transportation: 'Transportation',
      additionalInfo: 'Additional Information',
      submit: 'Request Help from Disaster Center',
      success: 'Help Request Submitted Successfully!',
      successMessage: 'Your request has been sent to the Disaster Center. They will contact you soon at the provided phone number.',
      error: 'Error Submitting Request',
      errorMessage: 'Please try again or contact the Disaster Center directly.',
      emergencyContact: 'For immediate emergencies, call: 117 (Sri Lanka Emergency Services)',
      getLocation: 'Get My Location',
      locationDetecting: 'Your location will be detected automatically. You can also click on the map to set your location.',
      clickMap: 'Click on the map to set your location',
      verificationImage: 'Upload Image for Verification (Sri Lanka Flood Disaster)',
      locationError: 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.',
      namePlaceholder: 'Enter your full name',
      phonePlaceholder: '0765395632',
      numberOfPeoplePlaceholder: 'How many people need help?',
      additionalInfoPlaceholder: 'Additional information...',
      urgencyLevel: 'Urgency Level',
      phoneInvalid: 'Please enter a valid Sri Lankan phone number.'
    },
    services: {
      Shelter: 'Shelter',
      Food: 'Food & Water',
      Medical: 'Medical Assistance',
      Clothing: 'Clothing',
      Transportation: 'Transportation'
    },
    createCenterForm: {
      title: 'Create New Disaster Center',
      subtitle: 'Register a new disaster relief center to help those in need',
      nameLabel: 'Center Name',
      namePlaceholder: 'Enter disaster center name',
      addressLabel: 'Full Address',
      addressPlaceholder: 'Enter complete address',
      phoneLabel: 'Contact Phone',
      phonePlaceholder: '0765395632',
      phoneInvalid: 'Please enter a valid Sri Lankan phone number.',
      capacityLabel: 'Maximum Capacity',
      capacityPlaceholder: 'Maximum number of people',
      statusLabel: 'Status',
      selectStatus: 'Select status',
      servicesLabel: 'Services',
      selectAll: 'Select all that apply',
      locationOnMapLabel: 'Location',
      mapInstruction: 'Click on the map to select the center\'s location',
      imageLabel: 'Center Image',
      additionalInfoLabel: 'Additional Information',
      additionalInfoPlaceholder: 'Any additional information about the center (Optional)',
      submitButton: 'Add Disaster Center',
      successTitle: 'Disaster Center Added Successfully!',
      successMessage: 'Your disaster center has been registered and will appear on the map.',
      errorTitle: 'Error Adding Center',
      errorMessage: 'There was an error adding the disaster center. Please try again.',
      selectServicesAlert: 'Please select at least one service.',
      locationRequired: 'Please select a location on the map.',
      locationError: 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.'
    },
    status: {
      active: 'Active',
      limited: 'Limited',
      full: 'Full'
    }
  },
  si: {
    dashboard: {
      title: 'විපත් කළමණාකරණ උපකරණ පුවරුව',
      subtitle: 'ගංවතුර උපකාර මධ්‍යස්ථාන සජීවී නිරීක්ෂණය',
      refresh: 'නැවත පූරණය',
      requestHelp: 'උදව් ඉල්ලන්න',
      emergency: 'හදිසි'
    },
    sidebar: {
      overview: 'දළ විශ්ලේෂණය',
      disasterCenters: 'විපත් මධ්‍යස්ථාන',
      helpRequests: 'උදව් ඉල්ලීම්',
      requestHelp: 'උදව් ඉල්ලන්න',
      createCenter: 'මධ්‍යස්ථානයක් සාදන්න',
      emergencyContact: 'හදිසි: 117'
    },
    stats: {
      totalCenters: 'සම්පූර්ණ මධ්‍යස්ථාන',
      activeCenters: 'සක්‍රිය මධ්‍යස්ථාන',
      limitedCapacity: 'සීමිත ධාරිතාව',
      totalCapacity: 'සම්පූර්ණ ධාරිතාව'
    },
    map: {
      title: 'විපත් මධ්‍යස්ථාන සිතියම',
      showOnlyRequests: 'උදව් ඉල්ලීම් පමණක් පෙන්වන්න',
      showAll: 'සියල්ල පෙන්වන්න',
      active: 'සක්‍රිය',
      limited: 'සීමිත',
      full: 'පිරී ඇත',
      helpRequests: 'උදව් ඉල්ලීම්'
    },
    centers: {
      title: 'සියලුම විපත් මධ්‍යස්ථාන',
      search: 'මධ්‍යස්ථාන සොයන්න...',
      name: 'නම',
      location: 'ස්ථානය',
      verified: 'සත්‍යාපනය කරන ලදී',
      unverified: 'සත්‍යාපනය නොකළ',
      verify: 'සත්‍යාපනය කරන්න',
      unverify: 'සත්‍යාපනය ඉවත් කරන්න',
      verificationStatus: 'සත්‍යාපන තත්වය',
      phone: 'දුරකථන',
      capacity: 'ධාරිතාව',
      status: 'තත්වය',
      services: 'සේවා',
      additionalInfo: 'අතිරේක තොරතුරු',
      actions: 'ක්‍රියා',
      viewOnMap: 'සිතියමේ බලන්න',
      call: 'ඇමතුම'
    },
    requests: {
      title: 'මෑත උදව් ඉල්ලීම්',
      noRequests: 'තවමත් උදව් ඉල්ලීම් නැත',
      name: 'නම',
      phone: 'දුරකථන',
      location: 'ස්ථානය',
      people: 'මිනිසුන්',
      needs: 'අවශ්‍යතා',
      additionalInfo: 'අතිරේක තොරතුරු',
      call: 'ඇමතුම',
      shareLocation: 'ස්ථානය බෙදාගන්න',
      verified: 'සත්‍යාපනය කරන ලදී',
      unverified: 'සත්‍යාපනය නොකළ',
      verify: 'සත්‍යාපනය කරන්න',
      unverify: 'සත්‍යාපනය ඉවත් කරන්න',
      verificationStatus: 'සත්‍යාපන තත්වය',
      verificationNotes: 'සත්‍යාපන සටහන්',
      verificationNotesPlaceholder: 'මෙම සත්‍යාපනය පිළිබඳ ඕනෑම සටහනක් එක් කරන්න (විකල්ප)',
      verifyRequest: 'ඉල්ලීම සත්‍යාපනය කරන්න',
      cancel: 'අවලංගු කරන්න',
      requestDetails: 'ඉල්ලීම් විස්තර'
    },
    helpForm: {
      title: 'ශ්‍රී ලංකා ගංවතුර විපත් - උදව් ඉල්ලීම',
      subtitle: 'ගංවතුර නිසා නිවාස රහිත වී ඇත්නම්, කරුණාකර විපත් මධ්‍යස්ථානයෙන් උදව් ඉල්ලීමට මෙම පෝරමය පුරවන්න',
      name: 'සම්පූර්ණ නම',
      phone: 'දුරකථන අංකය',
      location: 'වර්තමාන ස්ථානය',
      numberOfPeople: 'උදව් අවශ්‍ය මිනිසුන්ගේ සංඛ්‍යාව',
      urgentNeeds: 'හදිසි අවශ්‍යතා (සියල්ල තෝරන්න)',
      shelter: 'හදිසි නවාතැන',
      food: 'ආහාර සහ ජලය',
      medical: 'වෛද්‍ය උදව්',
      clothing: 'ඇඳුම්',
      transportation: 'ප්‍රවාහනය',
      additionalInfo: 'අතිරේක තොරතුරු',
      submit: 'විපත් මධ්‍යස්ථානයෙන් උදව් ඉල්ලන්න',
      success: 'උදව් ඉල්ලීම සාර්ථකව ඉදිරිපත් කරන ලදී!',
      successMessage: 'ඔබගේ ඉල්ලීම විපත් මධ්‍යස්ථානයට යවන ලදී. ඔවුන් ඉක්මනින් ඔබගේ දුරකථන අංකයට ඇමතීමට යනවා.',
      error: 'ඉල්ලීම ඉදිරිපත් කිරීමේ දෝෂය',
      errorMessage: 'කරුණාකර නැවත උත්සාහ කරන්න හෝ විපත් මධ්‍යස්ථානයට සෘජුවම සම්බන්ධ වන්න.',
      emergencyContact: 'හදිසි අවස්ථා සඳහා, ඇමතුම් කරන්න: 117 (ශ්‍රී ලංකා හදිසි සේවා)',
      getLocation: 'මගේ ස්ථානය ලබා ගන්න',
      locationDetecting: 'ඔබගේ ස්ථානය ස්වයංක්‍රීයව හඳුනා ගනු ලැබේ. ඔබට සිතියම මත ක්ලික් කර ඔබගේ ස්ථානය සැකසිය හැකිය.',
      clickMap: 'සිතියම මත ක්ලික් කර ඔබගේ ස්ථානය සැකසීමට',
      verificationImage: 'සත්‍යාපනය සඳහා රූපය උඩුගත කරන්න (ශ්‍රී ලංකා ගංවතුර විපත්)',
      locationError: 'ස්ථානය ශ්‍රී ලංකාව තුළ විය යුතුය. කරුණාකර ශ්‍රී ලංකාව තුළ ස්ථානයක් තෝරන්න.',
      namePlaceholder: 'ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න',
      phonePlaceholder: '0765395632',
      numberOfPeoplePlaceholder: 'කී දෙනෙකුට උදව් අවශ්‍යද?',
      additionalInfoPlaceholder: 'අතිරේක තොරතුරු...',
      urgencyLevel: 'හදිසිකම් මට්ටම',
      phoneInvalid: 'කරුණාකර වලංගු ශ්‍රී ලංකා දුරකථන අංකයක් ඇතුළත් කරන්න.'
    },
    services: {
      Shelter: 'නවාතැන',
      Food: 'ආහාර සහ ජලය',
      Medical: 'වෛද්‍ය උදව්',
      Clothing: 'ඇඳුම්',
      Transportation: 'ප්‍රවාහනය'
    },
    createCenterForm: {
      title: 'නව විපත් මධ්‍යස්ථානයක් සාදන්න',
      subtitle: 'අවශ්‍යතාවයක් ඇති අයට උදව් කිරීමට නව විපත් උපකාර මධ්‍යස්ථානයක් ලියාපදිංචි කරන්න',
      nameLabel: 'මධ්‍යස්ථානයේ නම',
      namePlaceholder: 'විපත් මධ්‍යස්ථානයේ නම ඇතුළත් කරන්න',
      addressLabel: 'සම්පූර්ණ ලිපිනය',
      addressPlaceholder: 'සම්පූර්ණ ලිපිනය ඇතුළත් කරන්න',
      phoneLabel: 'සම්බන්ධක දුරකථන',
      phonePlaceholder: '0765395632',
      phoneInvalid: 'කරුණාකර වලංගු ශ්‍රී ලංකා දුරකථන අංකයක් ඇතුළත් කරන්න.',
      capacityLabel: 'උපරිම ධාරිතාව',
      capacityPlaceholder: 'උපරිම පුද්ගල සංඛ්‍යාව',
      statusLabel: 'තත්වය',
      selectStatus: 'තත්වය තෝරන්න',
      servicesLabel: 'සේවා',
      selectAll: 'සියල්ල තෝරන්න',
      locationOnMapLabel: 'ස්ථානය',
      mapInstruction: 'මධ්‍යස්ථානයේ ස්ථානය තෝරා ගැනීමට සිතියම මත ක්ලික් කරන්න',
      imageLabel: 'මධ්‍යස්ථානයේ රූපය',
      additionalInfoLabel: 'අතිරේක තොරතුරු',
      additionalInfoPlaceholder: 'මධ්‍යස්ථානය පිළිබඳ අතිරේක තොරතුරු (විකල්ප)',
      submitButton: 'විපත් මධ්‍යස්ථානය එක් කරන්න',
      successTitle: 'විපත් මධ්‍යස්ථානය සාර්ථකව එක් කරන ලදී!',
      successMessage: 'ඔබගේ විපත් මධ්‍යස්ථානය ලියාපදිංචි කර ඇති අතර එය සිතියමේ දිස්වනු ඇත.',
      errorTitle: 'මධ්‍යස්ථානය එක් කිරීමේ දෝෂය',
      errorMessage: 'විපත් මධ්‍යස්ථානය එක් කිරීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.',
      selectServicesAlert: 'කරුණාකර අවම වශයෙන් සේවාවක් තෝරන්න.',
      locationRequired: 'කරුණාකර සිතියමේ ස්ථානයක් තෝරන්න.',
      locationError: 'ස්ථානය ශ්‍රී ලංකාව තුළ විය යුතුය. කරුණාකර ශ්‍රී ලංකාව තුළ ස්ථානයක් තෝරන්න.'
    },
    status: {
      active: 'සක්‍රිය',
      limited: 'සීමිත',
      full: 'පිරී ඇත'
    }
  }
}

// Get current language from localStorage or default to Sinhala
export function getCurrentLanguage(): Language {
  const saved = localStorage.getItem('language') as Language
  return saved && (saved === 'en' || saved === 'si') ? saved : 'si'
}

// Set language
export function setLanguage(lang: Language): void {
  localStorage.setItem('language', lang)
  // Trigger language change event
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }))
}

// Get translations for current language
export function t(): Translations {
  return translations[getCurrentLanguage()]
}

// Get translations for specific language
export function getTranslations(lang: Language): Translations {
  return translations[lang]
}

