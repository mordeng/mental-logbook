'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Edit2, Trash2, Plus, X } from 'lucide-react';

interface SafeContact {
  id: string;
  name: string;
  phone?: string;
  relationship?: string;
  order: number;
}

export default function SafeContactsManager() {
  const [contacts, setContacts] = useState<SafeContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/safe-contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/safe-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, order: contacts.length }),
      });

      if (response.ok) {
        await fetchContacts();
        setAdding(false);
        setFormData({ name: '', phone: '', relationship: '' });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleUpdate = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/safe-contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchContacts();
        setEditing(null);
        setFormData({ name: '', phone: '', relationship: '' });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/safe-contacts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const startEdit = (contact: SafeContact) => {
    setEditing(contact.id);
    setFormData({
      name: contact.name,
      phone: contact.phone || '',
      relationship: contact.relationship || '',
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setAdding(false);
    setFormData({ name: '', phone: '', relationship: '' });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Safe Contacts</h3>
          <p className="text-sm text-muted-foreground">
            Add up to 3 trusted people you can reach out to in times of crisis
          </p>
        </div>
        {contacts.length < 3 && !adding && (
          <Button onClick={() => setAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        )}
      </div>

      {adding && (
        <Card>
          <CardHeader>
            <CardTitle>Add Safe Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g., Friend, Family, Therapist"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Contact</Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="pt-6">
              {editing === contact.id ? (
                <form onSubmit={(e) => handleUpdate(contact.id, e)} className="space-y-4">
                  <div>
                    <Label htmlFor={`edit-name-${contact.id}`}>Name *</Label>
                    <Input
                      id={`edit-name-${contact.id}`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-phone-${contact.id}`}>Phone Number</Label>
                    <Input
                      id={`edit-phone-${contact.id}`}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-relationship-${contact.id}`}>Relationship</Label>
                    <Input
                      id={`edit-relationship-${contact.id}`}
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{contact.name}</h4>
                    {contact.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        <a href={`tel:${contact.phone}`} className="hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.relationship && (
                      <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(contact)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts.length === 0 && !adding && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No safe contacts added yet. Click "Add Contact" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
