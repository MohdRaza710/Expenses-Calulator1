import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Tabs,
  Tab,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Main App component
const App = () => {
  // State to manage the currently active tab
  const [activeTab, setActiveTab] = useState(0); // 0: Add Expense, 1: View Expenses, 2: Manage Income, 3: Summary
  // State to store all expenses
  const [expenses, setExpenses] = useState(() => {
    try {
      const storedExpenses = localStorage.getItem('expenseTrackerExpenses');
      return storedExpenses ? JSON.parse(storedExpenses) : [];
    } catch (error) {
      console.error("Failed to parse expenses from localStorage:", error);
      return [];
    }
  });

  // State to store custom categories
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const storedCustomCategories = localStorage.getItem('expenseTrackerCustomCategories');
      return storedCustomCategories ? JSON.parse(storedCustomCategories) : [];
    } catch (error) {
      console.error("Failed to parse custom categories from localStorage:", error);
      return [];
    }
  });

  // State to store salary amount
  const [salaryAmount, setSalaryAmount] = useState(() => {
    try {
      const storedSalary = localStorage.getItem('expenseTrackerSalary');
      return storedSalary ? parseFloat(storedSalary) : 0; // Default to 0 if no salary is stored
    } catch (error) {
      console.error("Failed to parse salary from localStorage:", error);
      return 0;
    }
  });

  // State for form inputs (for new category and salary)
  const [newCategoryName, setNewCategoryName] = useState(''); // State for new custom category input
  const [newSalaryInput, setNewSalaryInput] = useState(salaryAmount.toString()); // State for salary input field

  // State for message box
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

  // Predefined categories
  const predefinedCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'];

  // Combined list of all categories (predefined + custom)
  const allCategories = useMemo(() => {
    // Ensure uniqueness and combine
    const combined = [...new Set([...predefinedCategories, ...customCategories])];
    return combined.sort(); // Optional: sort categories alphabetically
  }, [predefinedCategories, customCategories]);

  // useEffect to save expenses to localStorage whenever the expenses state changes
  useEffect(() => {
    try {
      localStorage.setItem('expenseTrackerExpenses', JSON.stringify(expenses));
    } catch (error) {
      console.error("Failed to save expenses to localStorage:", error);
      showMessage('Failed to save expenses data. Please check your browser settings.', 'error');
    }
  }, [expenses]);

  // useEffect to save custom categories to localStorage whenever the customCategories state changes
  useEffect(() => {
    try {
      localStorage.setItem('expenseTrackerCustomCategories', JSON.stringify(customCategories));
    } catch (error) {
      console.error("Failed to save custom categories to localStorage:", error);
      showMessage('Failed to save category data. Please check your browser settings.', 'error');
    }
  }, [customCategories]);

  // useEffect to save salary amount to localStorage whenever the salaryAmount state changes
  useEffect(() => {
    try {
      localStorage.setItem('expenseTrackerSalary', salaryAmount.toString());
      setNewSalaryInput(salaryAmount.toString()); // Keep the input field in sync
    } catch (error) {
      console.error("Failed to save salary to localStorage:", error);
      showMessage('Failed to save salary data. Please check your browser settings.', 'error');
    }
  }, [salaryAmount]);

  // Function to show a message in the message box
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' }); // Clear message after 3 seconds
    }, 3000);
  };

  // Handle adding a new expense (now accepts items array)
  const handleAddExpense = (expenseDate, expenseCategory, expenseItems) => {
    // Input validation for overall expense
    if (!expenseDate) {
      showMessage('Please select a date for the expense.', 'error');
      return;
    }
    if (!expenseItems || expenseItems.length === 0) {
      showMessage('Please add at least one item to the expense.', 'error');
      return;
    }

    // Validate each item
    for (const item of expenseItems) {
      if (!item.name.trim() || isNaN(parseFloat(item.amount)) || parseFloat(item.amount) <= 0) {
        showMessage('Each item must have a valid name and a positive amount.', 'error');
        return;
      }
    }

    // Create a new expense object
    const newExpense = {
      id: Date.now(), // Unique ID for the expense
      date: expenseDate,
      category: expenseCategory,
      items: expenseItems.map(item => ({ // Ensure items are clean
        id: item.id,
        name: item.name.trim(),
        amount: parseFloat(item.amount)
      })),
    };

    // Add the new expense to the expenses array
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
    showMessage('Expense added successfully!', 'success');
  };

  // Handle adding a new custom category
  const handleAddCustomCategory = (newCategory) => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      showMessage('Category name cannot be empty.', 'error');
      return;
    }
    if (allCategories.includes(trimmedCategory)) {
      showMessage('Category already exists.', 'error');
      return;
    }

    setCustomCategories((prevCategories) => [...prevCategories, trimmedCategory]);
    showMessage(`Category "${trimmedCategory}" added successfully!`, 'success');
  };

  // Handle deleting a custom category
  const handleDeleteCustomCategory = (categoryToDelete) => {
    // Prevent deleting predefined categories
    if (predefinedCategories.includes(categoryToDelete)) {
      showMessage(`Cannot delete predefined category: "${categoryToDelete}".`, 'error');
      return;
    }

    // Check if any expenses are using this category
    const isCategoryUsed = expenses.some(expense => expense.category === categoryToDelete);
    if (isCategoryUsed) {
      showMessage(`Cannot delete category "${categoryToDelete}" because it is currently used by one or more expenses.`, 'error');
      return;
    }

    setCustomCategories((prevCategories) => prevCategories.filter((cat) => cat !== categoryToDelete));
    showMessage(`Category "${categoryToDelete}" deleted successfully!`, 'success');
  };

  // Handle deleting an expense
  const handleDeleteExpense = (id) => {
    setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
    showMessage('Expense deleted successfully!', 'success');
  };

  // Handle setting salary amount
  const handleSetSalary = () => {
    const parsedSalary = parseFloat(newSalaryInput);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      showMessage('Please enter a valid non-negative number for salary.', 'error');
      return;
    }
    setSalaryAmount(parsedSalary);
    showMessage('Salary updated successfully!', 'success');
  };

  // Calculate total expenses and expenses by category using useMemo for performance
  const { totalExpenses, expensesByCategory } = useMemo(() => {
    let total = 0;
    const categoryTotals = {};

    // Initialize category totals for all possible categories
    allCategories.forEach(cat => {
      categoryTotals[cat] = 0;
    });

    expenses.forEach((expense) => {
      // Sum amounts from all items within each expense
      const expenseTotal = expense.items.reduce((sum, item) => sum + item.amount, 0);
      total += expenseTotal;

      // Add to category total
      if (categoryTotals.hasOwnProperty(expense.category)) {
        categoryTotals[expense.category] += expenseTotal;
      } else {
        // Fallback for categories that might have been removed or are unexpected
        categoryTotals[expense.category] = expenseTotal;
      }
    });

    return { totalExpenses: total, expensesByCategory: categoryTotals };
  }, [expenses, allCategories]); // Recalculate only when expenses or allCategories change

  const remainingBalance = salaryAmount - totalExpenses;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f5f7fa, #c3cfe2)',
        // Reduced padding on extra-small screens for a tighter fit
        p: { xs: 1, sm: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          // Reduced padding on extra-small screens for a tighter fit
          p: { xs: 2, sm: 6 },
          width: '100%',
          // Adjusted maxWidth to allow more flexibility on smaller screens
          maxWidth: { xs: 'calc(100% - 16px)', sm: '960px' }, // 100% minus padding
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography variant="h3" component="h1" align="center" gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#333',
            mb: 4,
            letterSpacing: '-0.05em',
            // Adjusted font size for xs screens
            fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }
          }}
        >
          💸 Expense Tracker
        </Typography>

        {/* Message Box */}
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3, borderRadius: '8px' }}>
            {message.text}
          </Alert>
        )}

        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          aria-label="expense tracker tabs"
          centered
          // Added scrollable variant and allowScrollButtonsMobile for better mobile experience
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Add Expense" />
          <Tab label="View Expenses" />
          <Tab label="Manage Income" />
          <Tab label="Summary" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}>
          {activeTab === 0 && (
            <AddExpenseTab
              allCategories={allCategories}
              customCategories={customCategories}
              predefinedCategories={predefinedCategories}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
              handleAddExpense={handleAddExpense}
              handleAddCustomCategory={handleAddCustomCategory}
              handleDeleteCustomCategory={handleDeleteCustomCategory}
            />
          )}

          {activeTab === 1 && (
            <ViewExpensesTab expenses={expenses} handleDeleteExpense={handleDeleteExpense} />
          )}

          {activeTab === 2 && (
            <ManageIncomeTab
              newSalaryInput={newSalaryInput}
              setNewSalaryInput={setNewSalaryInput}
              handleSetSalary={handleSetSalary}
            />
          )}

          {activeTab === 3 && (
            <SummaryTab
              totalExpenses={totalExpenses}
              expensesByCategory={expensesByCategory}
              allCategories={allCategories}
              salaryAmount={salaryAmount}
              remainingBalance={remainingBalance}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// Add Expense Tab Content Component
const AddExpenseTab = ({
  allCategories,
  customCategories,
  predefinedCategories,
  newCategoryName,
  setNewCategoryName,
  handleAddExpense,
  handleAddCustomCategory,
  handleDeleteCustomCategory,
}) => {
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  // State to manage individual items within a single expense
  const [expenseItems, setExpenseItems] = useState([{ id: 1, name: '', amount: '' }]);
  const [nextItemId, setNextItemId] = useState(2); // For unique item IDs

  // Function to add a new item row
  const addItemRow = () => {
    setExpenseItems((prevItems) => [...prevItems, { id: nextItemId, name: '', amount: '' }]);
    setNextItemId((prevId) => prevId + 1);
  };

  // Function to remove an item row
  const removeItemRow = (idToRemove) => {
    setExpenseItems((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
  };

  // Handle changes to item name or amount
  const handleItemChange = (id, field, value) => {
    setExpenseItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Handle form submission for the entire expense
  const handleSubmitExpense = (e) => {
    e.preventDefault();
    handleAddExpense(expenseDate, expenseCategory, expenseItems);
    // Reset form after submission
    setExpenseDate('');
    setExpenseCategory('Food');
    setExpenseItems([{ id: 1, name: '', amount: '' }]); // Reset to one empty item row
    setNextItemId(2);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ mb: 3, color: '#555' }}>
        Add New Expense
      </Typography>
      <form onSubmit={handleSubmitExpense}>
        <Stack spacing={3}>
          <TextField
            label="Date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth required>
            <InputLabel id="expense-category-label">Category</InputLabel>
            <Select
              labelId="expense-category-label"
              id="expenseCategory"
              value={expenseCategory}
              label="Category"
              onChange={(e) => setExpenseCategory(e.target.value)}
            >
              {allCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Expense Items Section */}
          <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 3, mt: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 2, color: '#666' }}>
              Expense Items
            </Typography>
            <Stack spacing={2}>
              {expenseItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on xs, row on sm+
                    gap: { xs: 1, sm: 2 }, // Reduced gap on xs for tighter fit
                    alignItems: { xs: 'flex-end', sm: 'center' } // Align delete button to end on xs, center on sm+
                  }}
                >
                  <TextField
                    label="Item Name"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }} // Full width on xs, flexible on sm+
                    required
                  />
                  <TextField
                    label="Amount ($)"
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                    sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }} // Full width on xs, flexible on sm+
                    required
                    inputProps={{ step: "0.01", min: "0.01" }}
                  />
                  {expenseItems.length > 1 && (
                    <IconButton
                      onClick={() => removeItemRow(item.id)}
                      color="error"
                      aria-label="remove item"
                      sx={{ flexShrink: 0, mt: { xs: -5, sm: 0 } }} // Adjusted margin top for xs to pull it up
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Stack>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addItemRow}
              fullWidth
              sx={{ mt: 3, py: 1.5, borderRadius: '8px' }}
            >
              Add Another Item
            </Button>
          </Box>

          {/* Add New Category Section */}
          <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 3, mt: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 2, color: '#666' }}>
              Manage Categories
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                label="New Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  handleAddCustomCategory(newCategoryName);
                  setNewCategoryName('');
                }}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                Add Category
              </Button>
            </Stack>

            {/* List of Custom Categories with Delete Option */}
            {customCategories.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" component="h4" gutterBottom sx={{ mb: 1.5, color: '#777' }}>
                  Your Custom Categories:
                </Typography>
                <List sx={{ bgcolor: 'background.paper', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  {customCategories.map((category) => (
                    <ListItem
                      key={category}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteCustomCategory(category)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                      sx={{ borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}
                    >
                      <ListItemText primary={category} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{
              mt: 4,
              py: 2,
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #19B7E2 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .5)',
              },
            }}
          >
            Add Expense
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

// View Expenses Tab Content Component
const ViewExpensesTab = ({ expenses, handleDeleteExpense }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ mb: 3, color: '#555' }}>
      Your Expenses
    </Typography>
    {expenses.length === 0 ? (
      <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4 }}>
        No expenses added yet. Go to "Add Expense" tab to add some!
      </Typography>
    ) : (
      <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)' }}>
        <Table aria-label="expenses table">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f9f9f9' } }}>
                <TableCell>{expense.date}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>
                  <List dense disablePadding>
                    {expense.items.map((item) => (
                      <ListItem key={item.id} disableGutters sx={{ py: 0.5 }}>
                        <ListItemText primary={`${item.name}: $${item.amount.toFixed(2)}`} />
                      </ListItem>
                    ))}
                  </List>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  ${expense.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDeleteExpense(expense.id)}
                    color="error"
                    aria-label="delete expense"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Box>
);

// Manage Income Tab Content Component
const ManageIncomeTab = ({ newSalaryInput, setNewSalaryInput, handleSetSalary }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ mb: 3, color: '#555' }}>
      Manage Your Income
    </Typography>
    <Stack spacing={3}>
      <TextField
        label="Your Total Income ($)"
        type="number"
        value={newSalaryInput}
        onChange={(e) => setNewSalaryInput(e.target.value)}
        fullWidth
        inputProps={{ step: "0.01", min: "0" }}
      />
      <Button
        variant="contained"
        size="large"
        onClick={handleSetSalary}
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          background: 'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
          boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #7B1FA2 30%, #C51162 90%)',
            boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .5)',
          },
        }}
      >
        Update Income
      </Button>
    </Stack>
  </Box>
);

// Summary Tab Content Component
const SummaryTab = ({ totalExpenses, expensesByCategory, allCategories, salaryAmount, remainingBalance }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ mb: 3, color: '#555' }}>
      Expense Summary
    </Typography>

    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
      <Card sx={{ flexGrow: 1, borderRadius: '12px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)', bgcolor: '#e8f5e9' }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 1 }}>
            Total Income:
          </Typography>
          <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: '#2e7d32', fontSize: { xs: '2rem', sm: '3rem' } }}>
            ${salaryAmount.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ flexGrow: 1, borderRadius: '12px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)', bgcolor: '#ffebee' }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 1 }}>
            Total Expenses:
          </Typography>
          <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: '#c62828', fontSize: { xs: '2rem', sm: '3rem' } }}>
            ${totalExpenses.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{
        flexGrow: 1, borderRadius: '12px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
        bgcolor: remainingBalance >= 0 ? '#e3f2fd' : '#fff3e0'
      }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 1 }}>
            Remaining Balance:
          </Typography>
          <Typography variant="h4" component="p"
            sx={{
              fontWeight: 'bold',
              color: remainingBalance >= 0 ? '#1565c0' : '#ef6c00',
              fontSize: { xs: '2rem', sm: '3rem' }
            }}
          >
            ${remainingBalance.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
    </Stack>

    <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 2, color: '#555' }}>
      Expenses by Category:
    </Typography>
    {totalExpenses === 0 ? (
      <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4 }}>
        No expenses to summarize yet.
      </Typography>
    ) : (
      <Stack direction="row" flexWrap="wrap" spacing={2} useFlexGap sx={{ justifyContent: 'center' }}>
        {allCategories.map((category) => (
          <Card key={category} sx={{ minWidth: { xs: '100%', sm: 180 }, flexGrow: 1, borderRadius: '8px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.03)', bgcolor: '#fbfbfb' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="subtitle1" component="p" color="text.primary" sx={{ fontWeight: 'medium' }}>
                {category}
              </Typography>
              <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', color: '#424242', mt: 1 }}>
                ${(expensesByCategory[category] || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    )}
  </Box>
);

export default App;
