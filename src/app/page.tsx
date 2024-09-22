"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { tr } from 'date-fns/locale'

interface Todo {
  id: number;
  task: string;
  date: string;
  importance: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [importance, setImportance] = useState('normal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTodos = async (newTodos: Todo[]) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodos),
      });
      if (!response.ok) {
        throw new Error('Failed to save todos');
      }
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return; // Prevent adding todo without a date
    const newTodo: Todo = {
      id: Date.now(),
      task,
      date: format(date, 'yyyy-MM-dd'),
      importance,
      completed: false,
    };
    const newTodos = [...todos, newTodo];
    setTodos(newTodos);
    await saveTodos(newTodos);
    setTask('');
    setDate(undefined);
    setImportance('normal');
  };

  const toggleComplete = async (id: number) => {
    const newTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const deleteTodo = async (id: number) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const changeImportance = async (id: number, newImportance: string) => {
    const newTodos = todos.map(todo => 
      todo.id === id ? { ...todo, importance: newImportance } : todo
    );
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'yüksek':
        return 'bg-red-500 hover:bg-red-600';
      case 'normal':
        return 'bg-green-500 hover:bg-green-600';
      case 'düşük':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold my-8">Yapılacaklar listesinde harika bir gün...</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="md:w-1/2">
          <CardHeader>
            <CardTitle>Yeni Görev Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTodo} className="space-y-4">
              <Input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Yapılacak iş"
                required
              />
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: tr }) : <span>Tarih seçin</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Select value={importance} onValueChange={setImportance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Önem derecesi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="düşük">Düşük</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="yüksek">Yüksek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Ekle</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/2">
          <CardHeader>
            <CardTitle>Yapılacaklar Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {loading ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, index) => (
                  <li key={index}>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-8 w-[100px]" />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-16" />
                      </CardFooter>
                    </Card>
                  </li>
                ))
              ) : (
                // Actual todo list
                todos.map((todo) => (
                  <li key={todo.id}>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            <p className="font-semibold">{todo.task}</p>
                            <p className="text-sm text-gray-500">{todo.date}</p>
                          </div>
                          <Select 
                            value={todo.importance} 
                            onValueChange={(value) => changeImportance(todo.id, value)}
                          >
                            <SelectTrigger className={`w-[100px] ${getImportanceColor(todo.importance)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="düşük">Düşük</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="yüksek">Yüksek</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => toggleComplete(todo.id)}>
                          {todo.completed ? 'Geri Al' : 'Tamamlandı'}
                        </Button>
                        <Button variant="destructive" onClick={() => deleteTodo(todo.id)}>
                          Sil
                        </Button>
                      </CardFooter>
                    </Card>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
