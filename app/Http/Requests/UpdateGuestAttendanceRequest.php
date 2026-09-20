<?php

namespace App\Http\Requests;

use App\RsvpStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuestAttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([RsvpStatus::Confirmed->value, RsvpStatus::Declined->value])],
            'companions_count' => [
                'required_if:status,'.RsvpStatus::Confirmed->value,
                'integer',
                'min:0',
                'max:100',
            ],
            'reservation_handling' => [
                'exclude_unless:status,'.RsvpStatus::Declined->value,
                'required',
                Rule::in(['keep', 'cancel']),
            ],
        ];
    }
}
