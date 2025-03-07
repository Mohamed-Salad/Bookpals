import React from 'react';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-discord-text">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 bg-discord-darker border border-discord-channel rounded-lg text-discord-text placeholder-discord-muted focus:outline-none focus:ring-2 focus:ring-discord-gold focus:border-transparent"
      />
    </div>
  );
}; 