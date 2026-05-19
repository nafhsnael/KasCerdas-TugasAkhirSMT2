<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index()
    {
        $categories = Category::all();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori berhasil diambil',
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'is_active' => true,
        ]);

        // Log Activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Create Category',
            'model_type' => Category::class,
            'model_id' => $category->id,
            'ip_address' => $request->ip(),
            'level' => 'info',
            'data' => ['name' => $category->name],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan',
            'data' => $category
        ], 201);
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $category->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'],
        ]);

        // Log Activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Update Category',
            'model_type' => Category::class,
            'model_id' => $category->id,
            'ip_address' => $request->ip(),
            'level' => 'info',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data' => $category
        ]);
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $categoryName = $category->name;
        $category->delete();

        // Log Activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Delete Category',
            'model_type' => Category::class,
            'model_id' => $id,
            'ip_address' => $request->ip(),
            'level' => 'warning',
            'data' => ['deleted_category_name' => $categoryName],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus'
        ]);
    }
}
