export interface ContactFormData {
  name: string;
  company?: string;
  email: string;
  phone: string;
  product?: string;
  message: string;
  isEmergency: boolean;
}

export interface ContactInfo {
  address: string;
  city: string;
  province: string;
  phone: string;
  phone2?: string;
  whatsapp: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}
