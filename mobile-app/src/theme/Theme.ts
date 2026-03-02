export const Colors = {
    // Dark Theme (Primary Focus)
    dark: {
        bgBase: '#0f1115',
        bgBaseRGB: '15, 17, 21',
        bgSurface: '#1a1d24',
        bgSurfaceGlass: 'rgba(26, 29, 36, 0.6)',
        bgSurfaceGlassHover: 'rgba(26, 29, 36, 0.8)',

        primary: '#6366f1',
        primaryHover: '#4f46e5',
        secondary: '#ec4899',
        accent: '#14b8a6',

        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',

        borderGlass: 'rgba(255, 255, 255, 0.08)',
    },

    // Light Theme
    light: {
        bgBase: '#ffffff',
        bgBaseRGB: '255, 255, 255',
        bgSurface: '#ffffff',
        bgSurfaceGlass: 'rgba(255, 255, 255, 0.7)',
        bgSurfaceGlassHover: 'rgba(255, 255, 255, 0.9)',

        primary: '#4f46e5',
        primaryHover: '#4338ca',
        secondary: '#db2777',
        accent: '#0d9488',

        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#64748b',

        borderGlass: 'rgba(0, 0, 0, 0.08)',
    },

    // Gradients
    gradients: {
        primary: ['#6366f1', '#ec4899'],
        accent: ['#14b8a6', '#4f46e5'],
    }
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const Typography = {
    h1: {
        fontSize: 24,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 20,
        fontWeight: '700' as const,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 15,
        fontWeight: '400' as const,
    },
    bodyBold: {
        fontSize: 15,
        fontWeight: '600' as const,
    },
    small: {
        fontSize: 13,
        fontWeight: '400' as const,
    },
    muted: {
        fontSize: 13,
        fontWeight: '400' as const,
        opacity: 0.6,
    }
};
