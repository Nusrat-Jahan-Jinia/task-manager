<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class TaskSearchTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $tasks;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test user
        $this->user = User::factory()->create();

        // Create test tasks with different statuses and dates
        $this->tasks = collect([
            Task::factory()->create([
                'user_id' => $this->user->id,
                'name' => 'Project Alpha',
                'description' => 'High priority project task',
                'status' => 'To Do',
                'due_date' => Carbon::now()->addDays(5),
            ]),
            Task::factory()->create([
                'user_id' => $this->user->id,
                'name' => 'Project Beta',
                'description' => 'Medium priority project task',
                'status' => 'In Progress',
                'due_date' => Carbon::now()->addDays(3),
            ]),
            Task::factory()->create([
                'user_id' => $this->user->id,
                'name' => 'Regular Task',
                'description' => 'Normal priority task',
                'status' => 'Done',
                'due_date' => Carbon::now()->subDays(1),
            ]),
        ]);
    }

    public function test_search_tasks_with_query()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/search?q=project');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.tasks.data')
            ->assertJsonFragment(['name' => 'Project Alpha'])
            ->assertJsonFragment(['name' => 'Project Beta']);
    }

    public function test_filter_tasks_by_status()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/search?status[]=To Do&status[]=In Progress');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.tasks.data')
            ->assertJsonFragment(['status' => 'To Do'])
            ->assertJsonFragment(['status' => 'In Progress']);
    }

    public function test_filter_tasks_by_date_range()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/search?date_from=' . Carbon::now()->format('Y-m-d'));

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.tasks.data')
            ->assertJsonMissing(['name' => 'Regular Task']);
    }

    public function test_sort_tasks()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/search?sort=due_date&order=asc');

        $response->assertStatus(200);
        
        $tasks = $response->json('data.tasks.data');
        $this->assertTrue(
            Carbon::parse($tasks[0]['due_date'])->lt(Carbon::parse($tasks[1]['due_date']))
        );
    }

    public function test_pagination()
    {
        // Create additional tasks
        Task::factory()->count(10)->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/search?per_page=5&page=1');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data.tasks.data')
            ->assertJsonStructure([
                'data' => [
                    'tasks' => [
                        'current_page',
                        'data',
                        'first_page_url',
                        'last_page',
                        'next_page_url',
                        'per_page',
                        'total'
                    ]
                ]
            ]);
    }

    public function test_task_statistics()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/stats?period=month&group_by=status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'total_tasks',
                    'by_status' => [
                        'To Do',
                        'In Progress',
                        'Done'
                    ],
                    'overdue_tasks',
                    'completed_tasks',
                    'completion_rate',
                    'period' => [
                        'start',
                        'end'
                    ]
                ]
            ]);

        $data = $response->json('data');
        $this->assertEquals(3, $data['total_tasks']);
        $this->assertEquals(1, $data['by_status']['To Do']);
        $this->assertEquals(1, $data['by_status']['In Progress']);
        $this->assertEquals(1, $data['by_status']['Done']);
    }

    public function test_task_timeline()
    {
        $startDate = Carbon::now()->subDays(7)->format('Y-m-d');
        $endDate = Carbon::now()->addDays(7)->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->getJson("/api/tasks/timeline?start_date={$startDate}&end_date={$endDate}&group_by=week");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'timeline' => [
                        '*' => [
                            'period' => [
                                'start',
                                'end'
                            ],
                            'tasks',
                            'total_tasks',
                            'completed_tasks'
                        ]
                    ],
                    'summary' => [
                        'total_periods',
                        'total_tasks',
                        'avg_tasks_per_period'
                    ]
                ]
            ]);
    }

    public function test_invalid_search_parameters()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/search?sort=invalid_field');

        $response->assertStatus(422);
    }

    public function test_invalid_date_range()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/tasks/search?date_from=invalid-date');

        $response->assertStatus(422);
    }

    public function test_unauthorized_access()
    {
        $response = $this->getJson('/api/tasks/search');
        $response->assertStatus(401);
    }
} 