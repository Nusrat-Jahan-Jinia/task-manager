<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password')
        ]);
    }

    public function test_user_can_create_task()
    {
        $taskData = [
            'name' => 'Test Task',
            'description' => 'Test Description',
            'status' => 'To Do',
            'due_date' => '2024-12-31'
        ];

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/tasks', $taskData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'task' => [
                    'id',
                    'name',
                    'description',
                    'status',
                    'due_date'
                ]
            ]);
    }

    public function test_user_can_list_tasks()
    {
        Task::factory(3)->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'tasks' => [
                    'data',
                    'current_page',
                    'per_page'
                ]
            ]);
    }

    public function test_user_can_update_task()
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $updateData = [
            'name' => 'Updated Task Name',
            'status' => 'In Progress'
        ];

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/tasks/{$task->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'task' => [
                    'name' => 'Updated Task Name',
                    'status' => 'In Progress'
                ]
            ]);
    }

    public function test_user_can_delete_task()
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Task deleted successfully'
            ]);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
} 