export function getEndpointForNavigation(
    endpoints: Record<string, string>,
    useNavigation = false,
): string {
    return useNavigation ? `${endpoints.charts}/navigation` : '/navigate';
}
