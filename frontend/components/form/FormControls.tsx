

import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, required, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={props.id} className="mb-2 font-medium text-slate-800">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      {...props}
      required={required}
      className={`px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-800 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.id}-error` : undefined}
    />
    {error && <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({ label, error, required, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={props.id} className="mb-2 font-medium text-slate-800">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      {...props}
      required={required}
      className={`px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-800 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.id}-error` : undefined}
    />
    {error && <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, children, className, error, required, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={props.id} className="mb-2 font-medium text-slate-800">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      {...props}
      required={required}
      className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-800 ${className || ''} ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.id}-error` : undefined}
    >
      {children}
    </select>
    {error && <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface RatingSliderProps {
  label: string;
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RatingSlider: React.FC<RatingSliderProps> = ({ label, id, name, value, min, max, step, onChange }) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="font-medium text-gray-700">{label}</label>
        <span className="font-semibold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full text-sm">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        id={id}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-blue-600"
      />
    </div>
  );
};