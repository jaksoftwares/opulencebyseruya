import axios from 'axios';

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  baseUrl: string;
  transactionType: string;
  partyB: string;
}

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

interface AccessTokenResponse {
  access_token: string;
  expires_in: string;
}

class MpesaService {
  private config: MpesaConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      shortcode: process.env.MPESA_SHORTCODE || '5159242',
      passkey: process.env.MPESA_PASSKEY || '',
      baseUrl: process.env.MPESA_BASE_URL || 'https://api.safaricom.co.ke',
      transactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerBuyGoodsOnline',
      partyB: process.env.MPESA_PARTY_B || '4575012'
    };
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      console.log('Using cached M-Pesa access token');
      return this.accessToken;
    }

    try {
      console.log('Requesting new M-Pesa access token...');
      const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');

      const response = await axios.get<AccessTokenResponse>(
        `${this.config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('M-Pesa access token response:', {
        status: response.status,
        expires_in: response.data.expires_in,
        has_token: !!response.data.access_token
      });

      this.accessToken = response.data.access_token;
      // Token expires in the time specified, set expiry to 5 minutes before actual expiry
      this.tokenExpiry = new Date(Date.now() + (parseInt(response.data.expires_in) - 300) * 1000);

      console.log('M-Pesa access token obtained successfully');
      return this.accessToken;
    } catch (error: any) {
      console.error('Failed to get M-Pesa access token:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${this.config.baseUrl}/oauth/v1/generate`,
        consumerKey: this.config.consumerKey ? '[SET]' : '[NOT SET]',
        consumerSecret: this.config.consumerSecret ? '[SET]' : '[NOT SET]'
      });

      // Provide more specific error message
      const errorMessage = error.response?.data?.errorMessage ||
                          error.response?.data?.message ||
                          error.message ||
                          'Unknown authentication error';

      throw new Error(`M-Pesa authentication failed: ${errorMessage}`);
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const passwordString = `${this.config.shortcode}${this.config.passkey}${timestamp}`;
    return Buffer.from(passwordString).toString('base64');
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      console.log('=== M-PESA STK PUSH INITIATION ===');
      console.log('Request details:', {
        phoneNumber: request.phoneNumber,
        amount: request.amount,
        accountReference: request.accountReference,
        transactionDesc: request.transactionDesc
      });

      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      // Format phone number (remove + and ensure it starts with 254)
      const formattedPhone = request.phoneNumber.replace(/^\+?254/, '254');

      console.log('Phone number formatting:', {
        original: request.phoneNumber,
        formatted: formattedPhone
      });

      const payload = {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: this.config.transactionType,
        Amount: Math.round(request.amount), // Ensure integer amount
        PartyA: formattedPhone,
        PartyB: this.config.partyB,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc
      };

      console.log('STK Push payload:', {
        ...payload,
        Password: '[HIDDEN]' // Don't log the password
      });

      console.log('Making STK push request to:', `${this.config.baseUrl}/mpesa/stkpush/v1/processrequest`);
      console.log('STK Push payload:', {
        ...payload,
        Password: '[HIDDEN]',
        CallBackURL: payload.CallBackURL
      });

      const response = await axios.post(
        `${this.config.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('M-Pesa STK Push Response:', {
        status: response.status,
        data: response.data,
        success: response.data.ResponseCode === '0'
      });

      if (response.data.ResponseCode !== '0') {
        console.error('M-Pesa STK Push failed with response code:', response.data.ResponseCode);
        console.error('Response description:', response.data.ResponseDescription);
        console.error('Full response:', JSON.stringify(response.data, null, 2));
      }

      return {
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error: any) {
      console.error('=== M-PESA STK PUSH ERROR ===');
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `${this.config.baseUrl}/mpesa/stkpush/v1/processrequest`
      });

      // Check for specific error types
      if (error.code === 'ECONNABORTED') {
        throw new Error('M-Pesa request timed out. Please try again.');
      }

      if (error.response?.status === 401) {
        throw new Error('M-Pesa authentication failed. Please check your credentials.');
      }

      if (error.response?.status === 400) {
        throw new Error(`M-Pesa validation error: ${error.response.data?.errorMessage || 'Invalid request parameters'}`);
      }

      throw new Error(error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment');
    }
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      const payload = {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(
        `${this.config.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('M-Pesa STK Query failed:', error.response?.data || error.message);
      throw new Error('Failed to query payment status');
    }
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    // Kenyan phone number formats: 0712345678, +254712345678, 254712345678
    // Allow 7xxx or 1xxx after country code/prefix
    const kenyaPhoneRegex = /^(\+?254|0)[17]\d{8}$/;
    const isValid = kenyaPhoneRegex.test(phoneNumber);
    console.log('Phone number validation:', {
      input: phoneNumber,
      isValid,
      regex: kenyaPhoneRegex.toString()
    });
    return isValid;
  }

  // Format phone number to international format
  formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, hyphens, or other non-numeric characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // If it starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    }

    // If it starts with 254, add +
    if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    }

    // If it already starts with +, return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // Default: assume it's a local number and add +254
    return '+254' + cleaned;
  }
}

export const mpesaService = new MpesaService();
export type { STKPushRequest, STKPushResponse };