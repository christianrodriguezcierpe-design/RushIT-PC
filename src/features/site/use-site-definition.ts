import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  loadSiteDefinition,
  reorderManagedSections,
  updateBusinessProfile,
  updateManagedSectionContent,
} from "@/features/site/site-repository";
import type { BusinessProfile, ManagedSectionKey, SiteDefinition } from "@/types/site";

export const SITE_DEFINITION_QUERY_KEY = ["site-definition"];

export const useSiteDefinition = () => {
  return useQuery({
    queryKey: SITE_DEFINITION_QUERY_KEY,
    queryFn: loadSiteDefinition,
    staleTime: Number.POSITIVE_INFINITY,
  });
};

export const useUpdateBusinessProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businessProfile: BusinessProfile) => updateBusinessProfile(businessProfile),
    onSuccess: (siteDefinition) => {
      queryClient.setQueryData(SITE_DEFINITION_QUERY_KEY, siteDefinition);
    },
  });
};

export const useUpdateManagedSectionContentMutation = <K extends ManagedSectionKey>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sectionKey,
      content,
    }: {
      sectionKey: K;
      content: SiteDefinition["landing"]["managedContent"][K];
    }) => updateManagedSectionContent(sectionKey, content),
    onSuccess: (siteDefinition) => {
      queryClient.setQueryData(SITE_DEFINITION_QUERY_KEY, siteDefinition);
    },
  });
};

export const useReorderManagedSectionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionKeysInOrder: ManagedSectionKey[]) => reorderManagedSections(sectionKeysInOrder),
    onSuccess: (siteDefinition) => {
      queryClient.setQueryData(SITE_DEFINITION_QUERY_KEY, siteDefinition);
    },
  });
};
