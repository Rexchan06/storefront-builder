<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class CustomerAuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $existingCustomer = Customer::where('store_id', $request->store_id)
            ->where('email', $request->email)
            ->first();

        if ($existingCustomer) {
            return response()->json(['errors' => ['email' => ['Email already registered in this store']]], 422);
        }

        $customer = Customer::create([
            'store_id' => $request->store_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        $token = $customer->createToken('customer-auth-token')->plainTextToken;

        return response()->json([
            'customer' => $customer,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $customer = Customer::where('store_id', $request->store_id)
            ->where('email', $request->email)
            ->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $customer->createToken('customer-auth-token')->plainTextToken;

        return response()->json([
            'customer' => $customer,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
