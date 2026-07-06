<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecognitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'recipient_name' => 'required|string|max:100',
            'recipient_department' => 'nullable|string|max:100',
            'message' => 'required|string|min:10|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'recipient_name.required' => 'Please enter the name of the person you want to recognize.',
            'message.required' => 'Please write a recognition message.',
            'message.min' => 'Your message must be at least 10 characters.',
            'message.max' => 'Your message cannot exceed 500 characters.',
        ];
    }
}