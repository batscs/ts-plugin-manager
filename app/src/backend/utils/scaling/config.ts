interface Configuration {
    key: string;
    type: 'string' | 'number' | 'boolean' | 'dropdown';
    label: string;
    defaultValue: any;
    options?: any[]; // For dropdown types
}