'use client';

import React, { useEffect, useRef } from 'react';
import type { Control } from 'react-hook-form';
import { useFormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface SummernoteEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const SummernoteEditor = ({ value, onChange }: SummernoteEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isSummernoteInitialized = useRef(false);

    useEffect(() => {
        const initializeEditor = async () => {
            // Dynamically import jQuery and Summernote
            const $ = (await import('jquery')).default;
            await import('summernote/dist/summernote-lite.js');

            if (editorRef.current && !isSummernoteInitialized.current) {
                $(editorRef.current).summernote({
                    height: 150,
                    callbacks: {
                        onChange: (contents) => {
                            onChange(contents);
                        },
                    },
                    toolbar: [
                        ['style', ['bold', 'italic', 'underline', 'clear']],
                        ['font', ['strikethrough', 'superscript', 'subscript']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['height', ['height']]
                    ]
                });
                isSummernoteInitialized.current = true;
            }
        };

        initializeEditor();

        // Cleanup function
        return () => {
            const $ = (window as any).jQuery;
            if ($ && editorRef.current && $(editorRef.current).hasClass('note-editor')) {
                try {
                    $(editorRef.current).summernote('destroy');
                } catch(e) {
                    console.error('Could not destroy summernote editor', e);
                }
            }
            isSummernoteInitialized.current = false;
        };
    }, []); // Run only on mount

    // Set initial value
    useEffect(() => {
        const $ = (window as any).jQuery;
        if (isSummernoteInitialized.current && $ && editorRef.current && $(editorRef.current).hasClass('note-editor')) {
             if ($(editorRef.current).summernote('code') !== value) {
                $(editorRef.current).summernote('code', value);
            }
        }
    }, [value]);

    return (
        <FormItem>
            <FormLabel>Details</FormLabel>
            <FormControl>
                <div ref={editorRef} />
            </FormControl>
            <FormMessage />
        </FormItem>
    );
};

export default SummernoteEditor;
