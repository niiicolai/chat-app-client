import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid';
const toasts = ref([]);

export function useToast() {

    const add = (message, type = 'info', time = 5000) => {
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
