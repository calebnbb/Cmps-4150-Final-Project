// controllers/taskController.js
const Task = require('../models/Task');
const appEvents = require('../config/observer');

const taskController = {
  // GET / — public home: list all active tasks
  async getHome(req, res) {
    try {
      const tasks = await Task.find({ active: true }).populate('owner', 'username');
      res.render('home', {
        tasks,
        user: req.session.username || null,
        error: req.flash('error'),
        success: req.flash('success'),
      });
    } catch (err) {
      res.render('home', { tasks: [], user: null, error: ['Failed to load tasks'], success: [] });
    }
  },

  // GET /tasks — authenticated user's task dashboard
  async getDashboard(req, res) {
    try {
      const myTasks = await Task.find({ owner: req.session.userId });
      res.render('dashboard', {
        tasks: myTasks,
        username: req.session.username,
        error: req.flash('error'),
        success: req.flash('success'),
      });
    } catch (err) {
      req.flash('error', 'Failed to load dashboard');
      res.redirect('/');
    }
  },

  // POST /tasks — create new task (authenticated)
  async createTask(req, res) {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      req.flash('error', 'Task title is required');
      return res.redirect('/tasks');
    }
    try {
      const task = new Task({
        title: title.trim(),
        description: (description || '').trim(),
        owner: req.session.userId,
      });
      await task.save();
      appEvents.emit('task:created', { taskTitle: task.title, owner: req.session.username });
      req.flash('success', 'Task created successfully!');
      res.redirect('/tasks');
    } catch (err) {
      req.flash('error', 'Failed to create task');
      res.redirect('/tasks');
    }
  },

  // POST /volunteer — unauthenticated volunteer signs up
  async volunteer(req, res) {
    const { taskId, identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      req.flash('error', 'Please provide your email or unique identifier');
      return res.redirect('/');
    }
    try {
      const task = await Task.findById(taskId);
      if (!task || !task.active) {
        req.flash('error', 'Task not found or inactive');
        return res.redirect('/');
      }
      const alreadyIn = task.volunteers.some(v => v.identifier === identifier.trim());
      if (alreadyIn) {
        req.flash('error', 'You are already signed up for this task');
        return res.redirect('/');
      }
      task.volunteers.push({ identifier: identifier.trim() });
      await task.save();
      appEvents.emit('volunteer:joined', { taskTitle: task.title, volunteerId: identifier.trim() });
      req.flash('success', `Signed up for "${task.title}"! Use your identifier to look up your subscriptions.`);
      res.redirect('/');
    } catch (err) {
      req.flash('error', 'Failed to sign up. Please try again.');
      res.redirect('/');
    }
  },

  // GET /subscriptions?id=xxx — volunteer looks up their tasks
  async getSubscriptions(req, res) {
    const { id } = req.query;
    let tasks = [];
    let searched = false;
    if (id && id.trim()) {
      searched = true;
      tasks = await Task.find({
        active: true,
        'volunteers.identifier': id.trim(),
      }).populate('owner', 'username');
    }
    res.render('subscriptions', {
      tasks,
      identifier: id || '',
      searched,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  },

  // POST /tasks/:id/dismiss — owner dismisses a volunteer
  async dismissVolunteer(req, res) {
    const { taskId, identifier } = req.body;
    try {
      const task = await Task.findOne({ _id: taskId, owner: req.session.userId });
      if (!task) {
        req.flash('error', 'Task not found or not authorized');
        return res.redirect('/tasks');
      }
      task.volunteers = task.volunteers.filter(v => v.identifier !== identifier);
      await task.save();
      appEvents.emit('volunteer:dismissed', { taskTitle: task.title, volunteerId: identifier });
      req.flash('success', `Volunteer "${identifier}" removed from "${task.title}"`);
      res.redirect('/tasks');
    } catch (err) {
      req.flash('error', 'Failed to dismiss volunteer');
      res.redirect('/tasks');
    }
  },

  // GET /statistics — volunteer counts per active task
  async getStatistics(req, res) {
    try {
      const tasks = await Task.find({ active: true }).populate('owner', 'username');
      const stats = tasks.map(t => ({
        title: t.title,
        owner: t.owner.username,
        count: t.volunteers.length,
        createdAt: t.createdAt,
      }));
      res.render('statistics', { stats, user: req.session.username || null });
    } catch (err) {
      res.render('statistics', { stats: [], user: null });
    }
  },

  // POST /tasks/:id/delete — owner deletes (deactivates) a task
  async deleteTask(req, res) {
    try {
      const task = await Task.findOne({ _id: req.params.id, owner: req.session.userId });
      if (!task) {
        req.flash('error', 'Task not found');
        return res.redirect('/tasks');
      }
      task.active = false;
      await task.save();
      req.flash('success', 'Task removed');
      res.redirect('/tasks');
    } catch (err) {
      req.flash('error', 'Failed to remove task');
      res.redirect('/tasks');
    }
  },
};

module.exports = taskController;
