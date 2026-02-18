import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRealtime } from './useRealtime';
import { supabase } from '@/lib/supabaseClient';

// Mock supabase client
vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        channel: vi.fn(),
        removeChannel: vi.fn(),
    },
}));

describe('useRealtime', () => {
    let mockChannel: any;
    let onCallback: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockChannel = {
            on: vi.fn().mockImplementation((event, filter, callback) => {
                onCallback = callback;
                return mockChannel;
            }),
            subscribe: vi.fn().mockReturnThis(),
        };

        (supabase.channel as any).mockReturnValue(mockChannel);
    });

    it('should initialize with initial data', () => {
        const initialData = [{ id: '1', name: 'Test' }];
        const { result } = renderHook(() => useRealtime('test_table', initialData));
        expect(result.current).toEqual(initialData);
    });

    it('should subscribe to the table channel', () => {
        renderHook(() => useRealtime('test_table'));
        expect(supabase.channel).toHaveBeenCalledWith('public:test_table');
        expect(mockChannel.on).toHaveBeenCalledWith(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'test_table' },
            expect.any(Function)
        );
        expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should handle INSERT events', () => {
        const { result } = renderHook(() => useRealtime('test_table'));

        const payload = {
            eventType: 'INSERT',
            new: { id: '2', name: 'New Item' },
        };

        act(() => {
            onCallback(payload);
        });

        expect(result.current).toEqual([{ id: '2', name: 'New Item' }]);
    });

    it('should handle UPDATE events', () => {
        const initialData = [{ id: '1', name: 'Old Name' }];
        const { result } = renderHook(() => useRealtime('test_table', initialData));

        const payload = {
            eventType: 'UPDATE',
            new: { id: '1', name: 'New Name' },
        };

        act(() => {
            onCallback(payload);
        });

        expect(result.current).toEqual([{ id: '1', name: 'New Name' }]);
    });

    it('should handle DELETE events', () => {
        const initialData = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
        const { result } = renderHook(() => useRealtime('test_table', initialData));

        const payload = {
            eventType: 'DELETE',
            old: { id: '1' },
        };

        act(() => {
            onCallback(payload);
        });

        expect(result.current).toEqual([{ id: '2', name: 'Item 2' }]);
    });

    it('should unsubscribe on unmount', () => {
        const { unmount } = renderHook(() => useRealtime('test_table'));
        unmount();
        expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
});
