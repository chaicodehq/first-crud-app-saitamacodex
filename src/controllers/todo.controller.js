import { Todo } from "../models/todo.model.js";

/**
 * TODO: Create a new todo
 * - Extract data from req.body
 * - Create todo in database
 * - Return 201 with created todo
 */
export async function createTodo(req, res, next) {
  try {
    // Your code here
    const { title, completed, priority, tags, dueDate } = req.body;
    const todo = await Todo.create({
      title,
      completed,
      priority,
      tags,
      dueDate,
    });

    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: List todos with pagination and filters
 * - Support query params: page, limit, completed, priority, search
 * - Default: page=1, limit=10
 * - Return: { data: [...], meta: { total, page, limit, pages } }
 */
export async function listTodos(req, res, next) {
  try {
    // Your code here
    const { page = 1, limit = 10, completed, priority, search } = req.query;
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (priority) {
      query.priority = priority;
    }
    if (completed !== undefined) {
      if (!["true", "false"].includes(completed)) {
        throw new Error("Complted must be true / false");
      }
      // im query params values will be in string format
      query.completed = completed === "true";
    }

    // pagination calculations
    const pageNum = Number(page);
    const limits = Number(limit);
    const skipLogic = (pageNum - 1) * limits;

    // Fetch the paginated results
    const data = await Todo.find(query)
      .sort({ createdAt: -1 })
      .skip(skipLogic)
      .limit(limits)
      .lean();

    // get the total count of documetns matching the query
    const total = await Todo.countDocuments(query);

    res.status(200).json({
      data,
      meta: {
        total,
        page: pageNum,
        limit: limits,
        pages: Math.ceil(total / limits),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Get single todo by ID
 * - Return 404 if not found
 */
export async function getTodo(req, res, next) {
  try {
    const todoId = req.params.id;
    const getTodo = await Todo.findById(todoId);

    if (!getTodo) {
      return res.status(404).json({
        error: { message: `Todo not found.` },
      });
    }
    res.status(200).json(getTodo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Update todo by ID
 * - Use findByIdAndUpdate with { new: true, runValidators: true }
 * - Return 404 if not found
 */
export async function updateTodo(req, res, next) {
  try {
    // Your code here
    const id = req.params.id;
    const updateTodo = await Todo.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updateTodo) {
      return res.status(404).json({
        error: { message: `Todo not found` },
      });
    }
    res.status(200).json(updateTodo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Toggle completed status
 * - Find todo, flip completed, save
 * - Return 404 if not found
 */
export async function toggleTodo(req, res, next) {
  try {
    // Your code here
    const id = req.params.id;

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        error: { message: `Todo not found` },
      });
    }
    todo.completed = !todo.completed;
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Delete todo by ID
 * - Return 204 (no content) on success
 * - Return 404 if not found
 */
export async function deleteTodo(req, res, next) {
  try {
    // Your code here
    const id = req.params.id;
    const deleteTodo = await Todo.findByIdAndDelete(id);
    if (!deleteTodo) {
    }
    if (!deleteTodo) {
      return res.status(404).json({
        error: { message: `Todo not found` },
      });
    }
    res.status(204).json(deleteTodo);
  } catch (error) {
    next(error);
  }
}
