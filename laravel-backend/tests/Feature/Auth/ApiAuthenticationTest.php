<?php

use App\Models\User;
use App\Models\Customer;
use App\Models\Store;

test('store owner can register and receive authentication token', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(201)
             ->assertJsonStructure([
                 'user' => ['id', 'name', 'email'],
                 'token',
                 'token_type'
             ]);

    $this->assertDatabaseHas('users', [
        'email' => 'john@example.com',
    ]);
});

test('store owner cannot register with duplicate email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->postJson('/api/register', [
        'name' => 'Another User',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['email']);
});

test('store owner can login with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
             ->assertJsonStructure(['user', 'token', 'token_type']);
});

test('store owner cannot login with invalid password', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('correctpassword'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401);
});

test('customer can register with store-scoped email uniqueness', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $store1 = Store::factory()->create(['user_id' => $user1->id]);
    $store2 = Store::factory()->create(['user_id' => $user2->id]);

    // First customer in store 1
    $response1 = $this->postJson('/api/customer/register', [
        'store_id' => $store1->id,
        'name' => 'Customer One',
        'email' => 'customer@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '1234567890',
        'address' => '123 Main St',
    ]);

    $response1->assertStatus(201);

    // Same email in different store should succeed
    $response2 = $this->postJson('/api/customer/register', [
        'store_id' => $store2->id,
        'name' => 'Customer Two',
        'email' => 'customer@example.com', // Same email
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '0987654321',
        'address' => '456 Oak Ave',
    ]);

    $response2->assertStatus(201);

    // But duplicate in same store should fail
    $response3 = $this->postJson('/api/customer/register', [
        'store_id' => $store1->id,
        'name' => 'Customer Three',
        'email' => 'customer@example.com', // Duplicate in store 1
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '1111111111',
        'address' => '789 Pine Rd',
    ]);

    $response3->assertStatus(422);
});

test('protected routes require authentication', function () {
    $response = $this->getJson('/api/stores');

    $response->assertStatus(401);
});

test('authenticated user can access protected routes', function () {
    $user = User::factory()->create();

    // User without a store will get 404, which is expected behavior
    // This test just verifies authentication works, not that they have a store
    $response = $this->actingAs($user, 'sanctum')
                     ->getJson('/api/stores');

    // Either 200 (if store exists) or 404 (no store) are both valid authenticated responses
    // The key is it's NOT 401 Unauthorized
    $this->assertContains($response->status(), [200, 404]);
    $response->assertDontSee('Unauthenticated');
});
