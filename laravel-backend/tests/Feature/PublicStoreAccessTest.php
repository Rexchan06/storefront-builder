<?php

use App\Models\User;
use App\Models\Store;
use App\Models\Product;

test('public can view active store without authentication', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'store_slug' => 'public-store',
        'is_active' => true,
    ]);

    Product::factory()->count(3)->create([
        'store_id' => $store->id,
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/public/stores/public-store');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'store' => ['id', 'store_name', 'store_slug'],
                 'products',
             ])
             ->assertJsonCount(3, 'products');
});

test('public cannot view inactive store', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'store_slug' => 'inactive-store',
        'is_active' => false,
    ]);

    $response = $this->getJson('/api/public/stores/inactive-store');

    $response->assertStatus(403);
});

test('public store only shows active products', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'store_slug' => 'test-store',
        'is_active' => true,
    ]);

    // Create 2 active and 2 inactive products
    Product::factory()->count(2)->create([
        'store_id' => $store->id,
        'is_active' => true,
    ]);

    Product::factory()->count(2)->create([
        'store_id' => $store->id,
        'is_active' => false,
    ]);

    $response = $this->getJson('/api/public/stores/test-store');

    $response->assertStatus(200)
             ->assertJsonCount(2, 'products'); // Only active products
});

test('non-existent store returns 404', function () {
    $response = $this->getJson('/api/public/stores/non-existent-slug');

    $response->assertStatus(404);
});
