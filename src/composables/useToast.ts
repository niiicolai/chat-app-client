import { ref, type Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid';
import type Toast from '@/models/toast';

const toasts = ref([] as Toast[]);

interface UseToast {
    toasts: Ref<Toast[]>;
    add: (message: string, type?: string, time?: number) => void;
}

export function useToast() : UseToast {

    const add = (message: string, type = 'info', time = 5000) : void => {
        const uuid = uuidv4();
        const started = Date.now();
        toasts.value.push({ uuid, message, type, time, started });
        
        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.uuid !== uuid);
        }, time);
    };

    return {
        toasts,
        add,
    };
}
