export function parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhdwMy])?$/);
    if (!match) throw new Error('Invalid duration format');
    const value = parseInt(match[1], 10);
    const unit = match[2] || 's';
    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        case 'd': return value * 86400;
        case 'w': return value * 604800;
        case 'M': return value * 2592000;
        case 'y': return value * 31536000;
        default: throw new Error('Invalid duration unit');
    }
}