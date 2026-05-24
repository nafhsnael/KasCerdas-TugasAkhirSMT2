<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemConfig extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'category',
        'description',
        'is_sensitive',
    ];

    protected $casts = [
        'is_sensitive' => 'boolean',
    ];

    /**
     * Get config by key
     */
    public static function getByKey(string $key, $default = null)
    {
        $config = self::where('key', $key)->first();
        return $config ? $config->value : $default;
    }

    /**
     * Set config value
     */
    public static function setByKey(string $key, $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Get all configs by category
     */
    public static function getByCategory(string $category)
    {
        return self::where('category', $category)->get();
    }
}
