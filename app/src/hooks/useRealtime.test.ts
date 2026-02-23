import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRealtime } from './useRealtime';
import { supabase } from '@/lib/supabaseClient';

// Mock supabase client
vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        channel: vi.fn(),
        removeChannel: vi.fn(),
        from: vi.fn(),
    },
}));

describe('useRealtime', () => {
    let mockChannel: any;
    let onCallback: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockChannel = {
            on: vi.fn().mockImplementation((_event: any, _filter: any, callback: any) => {
                onCallback = callback;
                return mockChannel;
            }),
            subscribe: vi.fn().mockReturnThis(),
        };

        mockQueryBuilder = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((resolve: any) => resolve({ data: [], error: null })),
        };

        // Make queryBuilder thenable
        Object.defineProperty(mockQueryBuilder, 'then', {
            value: (resolve: any) => resolve({ data: [], error: null }),
            writable: true,
        });

        (supabase.channel as any).mockReturnValue(mockChannel);
        (supabase.from as any).mockReturnValue(mockQueryBuilder);
    });

    it('should initialize with initial data', () => {
        const initialData = [{ id: '1', name: 'Test' }];
        const { result } = renderHook(() => useRealtime('test_table', initialData));
        expect(result.current).toEqual(initialData);
    });

    it('should subscribe to the table channel without shopId filter', () => {
        renderHook(() => useRealtime('test_table'));
        expect(supabase.channel).toHaveBeenCalledWith('public:test_table');
        expect(mockChannel.on).toHaveBeenCalledWith(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'test_table' },
            expect.any(Function)
        );
        expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should subscribe with shopId filter when provided', () => {
        renderHook(() => useRealtime('test_table', [], 'shop-123'));
        expect(supabase.channel).toHaveBeenCalledWith('public:test_table:shop-123');
        expect(mockChannel.on).toHaveBeenCalledWith(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'test_table',
                filter: 'shopId=eq.shop-123',
            },
            expect.any(Function)
        );
        expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should fetch initial data filtered by shopId', () => {
        renderHook(() => useRealtime('test_table', [], 'shop-456'));
        expect(supabase.from).toHaveBeenCalledWith('test_table');
        expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('shopId', 'shop-456');
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
