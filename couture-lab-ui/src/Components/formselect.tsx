import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';
import styles from '../ComponentStyles/formselect.module.css';


interface Props {
    name: string,
    options: string[],
    register: UseFormRegister<FieldValues>,
    defaultSelect: string,
    errors: FieldErrors<FieldValues>,
    placeholder: string
}

export default function FormSelect({ name, options, register, defaultSelect, errors, placeholder }: Props) {
    // Refactor so profile.js and formselect.js don't both need to get the firestore data

    return (
        <div>
            <select 
                defaultValue={defaultSelect} 
                className={styles['form-select']} {...register(name, { required: `${name} required` })}
            >
                <option value="" disabled hidden>{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                ))}
            </select>
            {errors[name] && <p className={styles['form-errormsg']}>{errors[name]!.message as string}</p>}
        </div>
    );
}