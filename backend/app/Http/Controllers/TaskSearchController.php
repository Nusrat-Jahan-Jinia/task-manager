<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TaskSearchController extends Controller
{
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'nullable|string|max:255',
            'status' => 'nullable|array',
            'status.*' => ['nullable', Rule::in(['To Do', 'In Progress', 'Done'])],
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'sort' => ['nullable', Rule::in(['name', 'due_date', 'created_at', 'status'])],
            'order' => ['nullable', Rule::in(['asc', 'desc'])],
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $query = Task::where('user_id', auth()->id());

        // Apply search
        if ($request->filled('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->whereIn('status', $request->status);
        }

        // Apply date range filter
        if ($request->filled('date_from')) {
            $query->where('due_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('due_date', '<=', $request->date_to);
        }

        // Apply sorting
        $sortField = $request->input('sort', 'created_at');
        $sortOrder = $request->input('order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        // Apply pagination
        $perPage = $request->input('per_page', 15);
        $tasks = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'tasks' => $tasks,
                'filters' => [
                    'search' => $request->q,
                    'status' => $request->status,
                    'date_range' => [
                        'from' => $request->date_from,
                        'to' => $request->date_to
                    ],
                    'sort' => [
                        'field' => $sortField,
                        'order' => $sortOrder
                    ]
                ]
            ]
        ]);
    }

    public function stats(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period' => ['nullable', Rule::in(['today', 'week', 'month', 'year'])],
            'group_by' => ['nullable', Rule::in(['status', 'due_date'])]
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $period = $request->input('period', 'month');
        $startDate = match($period) {
            'today' => Carbon::today(),
            'week' => Carbon::now()->startOfWeek(),
            'month' => Carbon::now()->startOfMonth(),
            'year' => Carbon::now()->startOfYear(),
        };

        $query = Task::where('user_id', auth()->id())
                    ->where('created_at', '>=', $startDate);

        $totalTasks = $query->count();
        $byStatus = $query->get()->groupBy('status')
                         ->map(fn($tasks) => $tasks->count());
        
        $completedTasks = $byStatus['Done'] ?? 0;
        $overdueTasks = Task::where('user_id', auth()->id())
                           ->where('status', '!=', 'Done')
                           ->where('due_date', '<', Carbon::now())
                           ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_tasks' => $totalTasks,
                'by_status' => [
                    'To Do' => $byStatus['To Do'] ?? 0,
                    'In Progress' => $byStatus['In Progress'] ?? 0,
                    'Done' => $completedTasks
                ],
                'overdue_tasks' => $overdueTasks,
                'completed_tasks' => $completedTasks,
                'completion_rate' => $totalTasks > 0 ? ($completedTasks / $totalTasks) * 100 : 0,
                'period' => [
                    'start' => $startDate->toDateTimeString(),
                    'end' => Carbon::now()->toDateTimeString()
                ]
            ]
        ]);
    }

    public function timeline(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'group_by' => ['nullable', Rule::in(['day', 'week', 'month'])]
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $groupBy = $request->input('group_by', 'week');

        $periods = collect();
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $periodEnd = match($groupBy) {
                'day' => $currentDate->copy()->endOfDay(),
                'week' => $currentDate->copy()->endOfWeek(),
                'month' => $currentDate->copy()->endOfMonth(),
            };

            if ($periodEnd > $endDate) {
                $periodEnd = $endDate;
            }

            $tasks = Task::where('user_id', auth()->id())
                        ->whereBetween('due_date', [$currentDate, $periodEnd])
                        ->get();

            $periods->push([
                'period' => [
                    'start' => $currentDate->toDateTimeString(),
                    'end' => $periodEnd->toDateTimeString()
                ],
                'tasks' => $tasks,
                'total_tasks' => $tasks->count(),
                'completed_tasks' => $tasks->where('status', 'Done')->count()
            ]);

            $currentDate = match($groupBy) {
                'day' => $currentDate->addDay(),
                'week' => $currentDate->addWeek(),
                'month' => $currentDate->addMonth(),
            };
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'timeline' => $periods,
                'summary' => [
                    'total_periods' => $periods->count(),
                    'total_tasks' => $periods->sum('total_tasks'),
                    'avg_tasks_per_period' => $periods->average('total_tasks')
                ]
            ]
        ]);
    }
} 