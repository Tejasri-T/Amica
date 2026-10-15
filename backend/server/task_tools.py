"""
Amica — Task Management Tools
LangChain tools for adding, retrieving, updating, and checking task conflicts.
"""

import json
from datetime import datetime, date, time, timedelta
from typing import Optional
from langchain_core.tools import tool
from sqlalchemy import and_

from database import get_db_session, Task, TaskPriority, TaskStatus


# ---------------------------------------------------------------------------
# Tool: Add Task
# ---------------------------------------------------------------------------
@tool
def add_task(
    title: str,
    description: str = "",
    due_date: Optional[str] = None,
    due_time: Optional[str] = None,
    duration_minutes: int = 60,
    priority: str = "medium",
) -> str:
    """Add a new task to the user's task list.

    Args:
        title: The name/title of the task.
        description: A detailed description of the task.
        due_date: Due date in YYYY-MM-DD format (e.g., '2026-10-15').
        due_time: Due time in HH:MM format using 24-hour clock (e.g., '14:30').
        duration_minutes: Estimated duration in minutes (default 60).
        priority: Priority level — 'low', 'medium', or 'high'.
    """
    try:
        # Parse date/time
        parsed_date = None
        parsed_time = None

        if due_date:
            parsed_date = datetime.strptime(due_date, "%Y-%m-%d").date()
        if due_time:
            parsed_time = datetime.strptime(due_time, "%H:%M").time()

        # Validate priority
        try:
            task_priority = TaskPriority(priority.lower())
        except ValueError:
            task_priority = TaskPriority.medium

        # Check for conflicts before adding
        if parsed_date and parsed_time:
            conflict_result = _check_time_conflict(
                parsed_date, parsed_time, duration_minutes
            )
            if conflict_result:
                return (
                    f"⚠ SCHEDULING CONFLICT DETECTED!\n{conflict_result}\n"
                    f"The task '{title}' was NOT added. "
                    f"Please suggest a different time to the user."
                )

        with get_db_session() as session:
            new_task = Task(
                title=title,
                description=description,
                due_date=parsed_date,
                due_time=parsed_time,
                duration_minutes=str(duration_minutes),
                priority=task_priority,
                status=TaskStatus.pending,
            )
            session.add(new_task)
            session.flush()
            task_dict = new_task.to_dict()

        return f"✓ Task added successfully!\n{json.dumps(task_dict, indent=2)}"

    except Exception as e:
        return f"✗ Error adding task: {str(e)}"


# ---------------------------------------------------------------------------
# Tool: Get Tasks
# ---------------------------------------------------------------------------
@tool
def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
    upcoming_days: Optional[int] = None,
) -> str:
    """Retrieve tasks from the user's task list, optionally filtered.

    Args:
        status: Filter by status — 'pending', 'in_progress', or 'completed'.
        priority: Filter by priority — 'low', 'medium', or 'high'.
        due_date: Filter by specific due date in YYYY-MM-DD format.
        upcoming_days: Show tasks due within the next N days.
    """
    try:
        with get_db_session() as session:
            query = session.query(Task)

            if status:
                try:
                    query = query.filter(Task.status == TaskStatus(status.lower()))
                except ValueError:
                    pass

            if priority:
                try:
                    query = query.filter(
                        Task.priority == TaskPriority(priority.lower())
                    )
                except ValueError:
                    pass

            if due_date:
                parsed = datetime.strptime(due_date, "%Y-%m-%d").date()
                query = query.filter(Task.due_date == parsed)

            if upcoming_days:
                today = date.today()
                end_date = today + timedelta(days=upcoming_days)
                query = query.filter(
                    and_(Task.due_date >= today, Task.due_date <= end_date)
                )

            # Order by due_date, then due_time
            tasks = (
                query.order_by(Task.due_date.asc().nullslast(), Task.due_time.asc().nullslast())
                .all()
            )

            if not tasks:
                return "No tasks found matching the given criteria."

            result = f"Found {len(tasks)} task(s):\n\n"
            for t in tasks:
                status_icon = (
                    "✓" if t.status == TaskStatus.completed else
                    "▶" if t.status == TaskStatus.in_progress else "○"
                )
                priority_icon = (
                    "🔴" if t.priority == TaskPriority.high else
                    "🟡" if t.priority == TaskPriority.medium else "🟢"
                )
                result += (
                    f"{status_icon} {priority_icon} **{t.title}**\n"
                    f"   ID: {t.id}\n"
                    f"   Status: {t.status.value} | Priority: {t.priority.value}\n"
                )
                if t.description:
                    result += f"   Description: {t.description}\n"
                if t.due_date:
                    date_str = t.due_date.isoformat()
                    time_str = t.due_time.isoformat() if t.due_time else "no time set"
                    result += f"   Due: {date_str} at {time_str}\n"
                if t.duration_minutes:
                    result += f"   Duration: {t.duration_minutes} minutes\n"
                result += "\n"

            return result

    except Exception as e:
        return f"✗ Error retrieving tasks: {str(e)}"


# ---------------------------------------------------------------------------
# Tool: Update Task
# ---------------------------------------------------------------------------
@tool
def update_task(
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    due_time: Optional[str] = None,
    duration_minutes: Optional[int] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
) -> str:
    """Update an existing task's fields.

    Args:
        task_id: The UUID of the task to update.
        title: New title for the task.
        description: New description.
        due_date: New due date in YYYY-MM-DD format.
        due_time: New due time in HH:MM format.
        duration_minutes: New duration in minutes.
        priority: New priority — 'low', 'medium', or 'high'.
        status: New status — 'pending', 'in_progress', or 'completed'.
    """
    try:
        with get_db_session() as session:
            task = session.query(Task).filter(Task.id == task_id).first()
            if not task:
                return f"✗ Task with ID '{task_id}' not found."

            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if due_date is not None:
                task.due_date = datetime.strptime(due_date, "%Y-%m-%d").date()
            if due_time is not None:
                task.due_time = datetime.strptime(due_time, "%H:%M").time()
            if duration_minutes is not None:
                task.duration_minutes = str(duration_minutes)
            if priority is not None:
                try:
                    task.priority = TaskPriority(priority.lower())
                except ValueError:
                    pass
            if status is not None:
                try:
                    task.status = TaskStatus(status.lower())
                except ValueError:
                    pass

            # Check conflicts if date/time changed
            check_date = task.due_date
            check_time = task.due_time
            check_duration = int(task.duration_minutes) if task.duration_minutes else 60

            if check_date and check_time:
                conflict = _check_time_conflict(
                    check_date, check_time, check_duration, exclude_id=task_id
                )
                if conflict:
                    return (
                        f"⚠ SCHEDULING CONFLICT DETECTED!\n{conflict}\n"
                        f"The update was NOT applied. Suggest a different time."
                    )

            task.updated_at = datetime.utcnow()
            session.flush()
            return f"✓ Task updated successfully!\n{json.dumps(task.to_dict(), indent=2)}"

    except Exception as e:
        return f"✗ Error updating task: {str(e)}"


# ---------------------------------------------------------------------------
# Tool: Complete Task
# ---------------------------------------------------------------------------
@tool
def complete_task(task_id: str) -> str:
    """Mark a task as completed.

    Args:
        task_id: The UUID of the task to mark as completed.
    """
    try:
        with get_db_session() as session:
            task = session.query(Task).filter(Task.id == task_id).first()
            if not task:
                return f"✗ Task with ID '{task_id}' not found."

            task.status = TaskStatus.completed
            task.updated_at = datetime.utcnow()
            session.flush()

            return f"✓ Task '{task.title}' marked as completed!"

    except Exception as e:
        return f"✗ Error completing task: {str(e)}"


# ---------------------------------------------------------------------------
# Tool: Delete Task
# ---------------------------------------------------------------------------
@tool
def delete_task(task_id: str) -> str:
    """Delete a task from the task list.

    Args:
        task_id: The UUID of the task to delete.
    """
    try:
        with get_db_session() as session:
            task = session.query(Task).filter(Task.id == task_id).first()
            if not task:
                return f"✗ Task with ID '{task_id}' not found."

            task_title = task.title
            session.delete(task)

            return f"✓ Task '{task_title}' has been deleted."

    except Exception as e:
        return f"✗ Error deleting task: {str(e)}"


# ---------------------------------------------------------------------------
# Tool: Check Conflicts
# ---------------------------------------------------------------------------
@tool
def check_conflicts(
    due_date: str,
    due_time: str,
    duration_minutes: int = 60,
) -> str:
    """Check if a proposed time slot conflicts with existing tasks.

    Args:
        due_date: The date to check in YYYY-MM-DD format.
        due_time: The time to check in HH:MM format.
        duration_minutes: Duration of the proposed task in minutes.
    """
    try:
        parsed_date = datetime.strptime(due_date, "%Y-%m-%d").date()
        parsed_time = datetime.strptime(due_time, "%H:%M").time()

        conflict = _check_time_conflict(parsed_date, parsed_time, duration_minutes)
        if conflict:
            return f"⚠ CONFLICT FOUND:\n{conflict}"
        else:
            return (
                f"✓ No conflicts! The time slot {due_date} at {due_time} "
                f"({duration_minutes} min) is available."
            )

    except Exception as e:
        return f"✗ Error checking conflicts: {str(e)}"


# ---------------------------------------------------------------------------
# Internal: Conflict Detection
# ---------------------------------------------------------------------------
def _check_time_conflict(
    check_date: date,
    check_time: time,
    duration_minutes: int,
    exclude_id: Optional[str] = None,
) -> Optional[str]:
    """
    Check if a proposed time slot overlaps with any existing task.
    Returns a conflict description string, or None if no conflict.
    """
    proposed_start = datetime.combine(check_date, check_time)
    proposed_end = proposed_start + timedelta(minutes=duration_minutes)

    with get_db_session() as session:
        # Get all tasks on the same date that have a time set and are not completed
        query = session.query(Task).filter(
            and_(
                Task.due_date == check_date,
                Task.due_time.isnot(None),
                Task.status != TaskStatus.completed,
            )
        )

        if exclude_id:
            query = query.filter(Task.id != exclude_id)

        tasks_on_day = query.all()

        conflicts = []
        for t in tasks_on_day:
            task_start = datetime.combine(t.due_date, t.due_time)
            task_duration = int(t.duration_minutes) if t.duration_minutes else 60
            task_end = task_start + timedelta(minutes=task_duration)

            # Check overlap: two intervals overlap if start1 < end2 AND start2 < end1
            if proposed_start < task_end and task_start < proposed_end:
                conflicts.append(
                    f"  • '{t.title}' ({t.due_time.strftime('%H:%M')}"
                    f"–{task_end.strftime('%H:%M')}, {task_duration}min)"
                )

        if conflicts:
            return (
                f"Time slot {check_time.strftime('%H:%M')}"
                f"–{proposed_end.strftime('%H:%M')} "
                f"conflicts with:\n" + "\n".join(conflicts)
            )

    return None


# ---------------------------------------------------------------------------
# All tools list (for binding to LLM)
# ---------------------------------------------------------------------------
task_tools = [add_task, get_tasks, update_task, complete_task, delete_task, check_conflicts]
