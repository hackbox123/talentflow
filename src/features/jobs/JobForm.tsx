// src/features/jobs/JobForm.tsx
import { Button, FormControl, FormLabel, Input, ModalBody, ModalFooter, VStack,FormErrorMessage } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { type Job } from '../../api/db';

interface Props {
  job?: Job;
  allJobs: Job[]; // NEW: allJobs prop for validation
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading:boolean;
}
type FormData = {
  title: string;
  slug: string;
};

export const JobForm = ({ job, allJobs, onSubmit, onCancel,isLoading }: Props) => {
    const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: job || { title: '', slug: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModalBody>
        <VStack spacing={4}>
          <FormControl isInvalid={!!errors.title}>
            <FormLabel>Job Title</FormLabel>
            <Input {...register('title', { required: 'Title is required' })} />
          </FormControl>
          <FormControl isInvalid={!!errors.slug}>
            <FormLabel>Slug</FormLabel>
            <Input 
              id="slug"
              {...register('slug', { 
                required: 'Slug is required',
                // NEW: Unique slug validation logic
                validate: (value) => {
                  const otherJobs = job ? allJobs.filter(j => j.id !== job.id) : allJobs;
                  const isUnique = !otherJobs.some(j => j.slug === value);
                  return isUnique || 'This slug is already in use.';
                }
              })} 
            />
            <FormErrorMessage>
              {errors.slug && errors.slug.message}
            </FormErrorMessage>
          </FormControl>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onCancel} mr={3}>Cancel</Button>
        <Button colorScheme="blue" type="submit">Save</Button>
      </ModalFooter>
    </form>
  );
};