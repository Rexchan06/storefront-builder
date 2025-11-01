<?php

use App\Models\User;
use App\Models\Store;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('authenticated user can create a store', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
                     ->postJson('/api/stores', [
                         'store_name' => 'My Awesome Store',
                         'store_slug' => 'my-awesome-store',
                         'description' => 'A great store',
                         'contact_email' => 'store@example.com',
                         'contact_phone' => '1234567890',
                         'address' => '123 Store St',
                     ]);

    $response->assertStatus(201)
             ->assertJsonStructure([
                 'message',
                 'store' => ['id', 'store_name', 'store_slug', 'contact_email']
             ]);

    $this->assertDatabaseHas('stores', [
        'user_id' => $user->id,
        'store_slug' => 'my-awesome-store',
    ]);
});

test('store slug must be unique', function () {
    $user1 = User::factory()->create();
    $existingStore = Store::factory()->create(['store_slug' => 'unique-slug', 'user_id' => $user1->id]);

    $user2 = User::factory()->create();

    $response = $this->actingAs($user2, 'sanctum')
                     ->postJson('/api/stores', [
                         'store_name' => 'Another Store',
                         'store_slug' => 'unique-slug', // Duplicate
                         'contact_email' => 'another@example.com',
                     ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['store_slug']);
});

test('user can only access their own store', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $store1 = Store::factory()->create(['user_id' => $user1->id]);

    // User 2 tries to access User 1's store
    $response = $this->actingAs($user2, 'sanctum')
                     ->getJson("/api/stores/{$store1->id}");

    $response->assertStatus(403);
});

test('user can create product in their store', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')
                     ->postJson('/api/products', [
                         'store_id' => $store->id,
                         'name' => 'Test Product',
                         'description' => 'A great product',
                         'price' => 99.99,
                         'category' => 'electronics',
                         'stock_quantity' => 50,
                         'is_active' => true,
                     ]);

    $response->assertStatus(201)
             ->assertJson([
                 'message' => 'Product created successfully',
                 'data' => [
                     'name' => 'Test Product',
                     'price' => '99.99',
                     'stock_quantity' => 50,
                 ]
             ]);

    $this->assertDatabaseHas('products', [
        'store_id' => $store->id,
        'name' => 'Test Product',
    ]);
});

test('product price must be positive', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')
                     ->postJson('/api/products', [
                         'store_id' => $store->id,
                         'name' => 'Invalid Product',
                         'price' => -10.00, // Negative price
                         'stock_quantity' => 10,
                     ]);

    $response->assertStatus(422);
});

test('user can filter products by category', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);

    Product::factory()->create([
        'store_id' => $store->id,
        'category' => 'electronics',
        'name' => 'Laptop',
    ]);

    Product::factory()->create([
        'store_id' => $store->id,
        'category' => 'fashion',
        'name' => 'Shirt',
    ]);

    $response = $this->actingAs($user, 'sanctum')
                     ->getJson('/api/products?category=electronics');

    $response->assertStatus(200)
             ->assertJsonCount(1)
             ->assertJsonFragment(['name' => 'Laptop']);
});

test('inactive store cannot be published without active products', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'is_active' => false,
    ]);

    // No products yet
    $response = $this->actingAs($user, 'sanctum')
                     ->putJson("/api/stores/{$store->id}", [
                         'store_name' => $store->store_name,
                         'store_slug' => $store->store_slug,
                         'contact_email' => $store->contact_email,
                         'is_active' => true, // Try to activate
                     ]);

    $response->assertStatus(422);
});

test('store can be activated when it has active products', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'is_active' => false,
    ]);

    // Create an active product
    Product::factory()->create([
        'store_id' => $store->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user, 'sanctum')
                     ->putJson("/api/stores/{$store->id}", [
                         'store_name' => $store->store_name,
                         'store_slug' => $store->store_slug,
                         'contact_email' => $store->contact_email,
                         'is_active' => true,
                     ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('stores', [
        'id' => $store->id,
        'is_active' => true,
    ]);
});
